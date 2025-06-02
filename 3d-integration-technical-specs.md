# 3D Integration – Technical Specifications  
Modern 3D E-commerce Platform  
Author: Dennis Smith  
Last updated: 2025-06-02  

---

## 1  Stack Overview

| Layer                    | Choice | Rationale |
|--------------------------|--------|-----------|
| 3D Engine                | Three.js 0.162 | De-facto browser WebGL engine, ecosystem maturity |
| React binding            | React Three Fiber 9 | Declarative scene graph, hooks API, concurrent-mode friendly |
| Ancillary libs           | Drei, React-Spring | Re-usable helpers (OrbitControls, soft shadows, animations) |
| Asset format             | glTF 2.0 (GLB) | PBR ready, compressed, streamable |
| Compression              | Draco + Meshopt | Reduces payload ≤ 80 % |

---

## 2  Implementation Details (Three.js + R3F)

### Entry point component

    // packages/web-client/src/components/ProductViewer.tsx
    import { Canvas } from '@react-three/fiber';
    import { Suspense } from 'react';
    import { OrbitControls, Environment } from '@react-three/drei';
    import Model from './ProductModel';

    export default function ProductViewer({ modelUrl }: { modelUrl: string }) {
      return (
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45 }}
          gl={{ preserveDrawingBuffer: true }}
          dpr={[1, 2]}       // auto-adjust for HiDPI
        >
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.7} />
          <Suspense fallback={null}>
            <Model url={modelUrl} />
            <Environment preset="warehouse" />
          </Suspense>
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
      );
    }

### Model wrapper with bounds fitting & LOD

    import { useGLTF, Bounds, MeshTransmissionMaterial } from '@react-three/drei';

    export default function Model({ url }) {
      const { scene } = useGLTF(url, true, true);   // async + DRACO
      return (
        <Bounds fit clip observe margin={1.2}>
          <primitive object={scene} dispose={null} />
        </Bounds>
      );
    }

Key points  
* Automatic DRACO loader injection via `MeshoptDecoder`, placed in `/public/draco/`.  
* Assets requested with `?v=<etag>` query to leverage CDN caching.  
* `preserveDrawingBuffer` enables screenshot for sharing.

---

## 3  3D Model Pipeline & Optimization

Step | Tooling | Output
---- | ------- | ------
1  Artist exports FBX/OBJ | Blender exporter | source mesh
2  Convert to glTF | gltf-pipeline `gltf-pack` | uncompressed GLB
3  Mesh simplification | Simplygon / blender-decimate | LOD0-2
4  Texture baking | Marmoset / Blender | ≤ 2 × 4K PBR maps
5  Compression | `gltf-pack -i model.glb -o model.draco.glb -cc meshopt` | final asset
6  Upload & tag | Admin UI → S3 via presigned POST | `brand/sku/models/v1/model.glb`

Guidelines  
• Single model ≤ 15 MB (post-compression).  
• Provide separate low-poly variant for mobile fallback (< 4 MB).  
• Store texture atlases in KTX2 (BasisU) when Safari support lands.  

---

## 4  Performance Strategies

Technique | Description | Target gain
--------- | ----------- | -----------
Lazy loading | `Suspense` with dynamic import of Model component | First paint < 1 s
Use `pmndrs/drei` bounds | Avoid large world matrices | -10 ms layout
Instanced meshes | Chairs, bolts etc. share geometry | -60 % draw calls
`useFrame` throttling | Only update controls when interacted | -30 % main-thread
Shadow baking | Pre-render AO into textures | 0 real-time shadow cost
WebGL2 + `KHR_materials_variants` | Switch colors without duplicate meshes | VRAM saving

---

## 5  User Interaction Controls

Setting | Value
------- | -----
Rotate | LMB / single-finger drag
Zoom   | Wheel / pinch
Pan    | RMB / two-finger drag
Reset  | Double-tap / R key

Customization  

    const controls = useControls(
      { autoRotate: true, autoRotateSpeed: 2.0, maxPolarAngle: Math.PI / 2 }
    );

Analytics hook  

    import { useControlsEvents } from '@/hooks/useControlsEvents';
    useControlsEvents(controls, 'PRODUCT_VIEW'); // dispatch to Segment

---

## 6  Asset Loading & Management

Component | Responsibility
----------|---------------
`AssetManager` (shared) | Keeps a `Map` of GLTF loaders, progress UI
`useAssetPreload(sku)` | Pre-fetches product list models when idle
S3 + CloudFront | Signed URL (10 min) for private assets
Cache headers | `Cache-Control: public, max-age=31536000, immutable`
Service Worker | CacheFirst strategy for previously viewed models

---

## 7  Cross-Browser Compatibility

Concern | Mitigation
------- | ----------
WebGL 1 only (Safari 12) | Polyfill via `three/examples/jsm/` ES5 build
no WebGL | Fallback to 2D turntable GIF
Disabled WebGPU flag (Edge Canary) | Feature-detect via `!!navigator.gpu`
Draco decoder (wasm) blocked | Use fallback JS decoder for ≤ 2 MB models
Pointer events | Use `@use-gesture/react` abstracts mouse/touch

---

## 8  Mobile Performance Optimization

Metric | Target
------ | ------
Time-to-Interactive | < 3 s over 4G
FPS | ≥ 30 fps on iPhone 11 equivalent
GPU memory | ≤ 150 MB

Actions  
• Disable HDR environment on small screens (`window.devicePixelRatio < 2`).  
• Clamp max texture size to 2048.  
• Use `dpr={[1, 1.5]}` in `<Canvas>` to cap resolution.  
• Suspend auto-rotate when page hidden (Page Visibility API).  

---

## 9  Testing Strategy

Layer | Tool | What we test
----- | ---- | ------------
Unit | Jest + `@react-three/test-renderer` | Component props, render tree diff
Visual regression | Chromatic or Loki | Pixel diff after each PR
Interaction | Cypress + `cypress-real-events` | Orbit, pinch, responsive
Performance budget | Lighthouse CI + custom WebGL audit | Main-thread blocking, FPS
Device farm | BrowserStack | iOS / Android / Edge / Firefox matrices

Snapshot smoke test

    describe('ProductViewer', () => {
      it('renders GLTF scene', async () => {
        const { getByTestId } = render(<ProductViewer modelUrl="/demo.glb" />);
        await waitFor(() => expect(getByTestId('r3f-canvas')).toBeInTheDocument());
      });
    });

---

## 10  Progressive Enhancement

```html
<noscript>
  <img src="/turntable/product123.gif" alt="Product 360° view">
</noscript>
```

Detection flow  

    if (!window.WebGLRenderingContext) {
      render(<StaticImagesCarousel />);
    } else {
      render(<ProductViewer />);
    }

Server-side `Accept-CH: DPR, Viewport-Width` to tailor asset resolution.

---

## 11  Open Issues & Next Steps

1. Evaluate WebGPU path once Safari 17 stable.  
2. Integrate `gltfjsx` build-time transform to keep component tree diffable.  
3. Consider texture streaming with `Basis Universal` on CDN.  

