import { useState, useRef, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  useGLTF, 
  Bounds, 
  Html,
  useBounds,
  useProgress,
  Stats
} from '@react-three/drei';
import { ErrorBoundary } from 'react-error-boundary';
import * as THREE from 'three';
import { Button } from '@e3d/shared';

// Preload DRACO decoder
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Configure DRACO loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Loading indicator component
function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-32 h-32 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-neutral-700 font-medium">
          Loading {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// Model component with auto-centering
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  const bounds = useBounds();
  
  // Clone the scene to avoid modifying the cached original
  const clonedScene = useRef<THREE.Group>();
  
  if (!clonedScene.current) {
    clonedScene.current = scene.clone();
  }
  
  // Center the model after it's loaded
  useState(() => {
    // Wait for next frame to ensure the model is loaded
    setTimeout(() => bounds.refresh().clip().fit(), 100);
  });
  
  return <primitive object={clonedScene.current} dispose={null} />;
}

// Auto-rotation control
function AutoRotate({ enabled = true, speed = 0.5 }) {
  const { camera } = useThree();
  const autoRotateRef = useRef(enabled);
  
  useFrame((_, delta) => {
    if (autoRotateRef.current) {
      camera.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        delta * speed * 0.1
      );
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-neutral-100 rounded-lg">
      <h3 className="text-lg font-semibold text-error mb-2">Error Loading 3D Model</h3>
      <p className="text-sm text-neutral-700 mb-4">
        {error.message || "There was a problem loading the 3D model."}
      </p>
      <Button variant="primary" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </div>
  );
}

interface ProductViewerProps {
  /**
   * URL to the 3D model (GLB/GLTF format)
   */
  modelUrl: string;
  /**
   * Enable auto-rotation when not interacting
   * @default true
   */
  autoRotate?: boolean;
  /**
   * Enable performance stats (only in development)
   * @default false
   */
  showStats?: boolean;
  /**
   * Enable fullscreen button
   * @default true
   */
  enableFullscreen?: boolean;
  /**
   * Custom background color (hex or rgb)
   * @default "#ffffff"
   */
  backgroundColor?: string;
  /**
   * Environment preset for lighting
   * @default "warehouse"
   */
  environmentPreset?: 'warehouse' | 'forest' | 'city' | 'dawn' | 'night' | 'sunset' | 'apartment';
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * 3D Product Viewer Component
 * 
 * Renders a 3D model with interactive controls, environment lighting,
 * and responsive design. Supports fullscreen mode and auto-rotation.
 */
export default function ProductViewer({
  modelUrl,
  autoRotate = true,
  showStats = false,
  enableFullscreen = true,
  backgroundColor = '#ffffff',
  environmentPreset = 'warehouse',
  className = '',
}: ProductViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Listen for fullscreen change events
  useState(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[60vh] min-h-[400px] max-h-[600px]'} ${className}`}
      data-testid="product-viewer"
    >
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Reset the error state and retry loading
          useGLTF.clear(modelUrl);
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45 }}
          gl={{ 
            preserveDrawingBuffer: true, // Enables taking screenshots
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          dpr={[1, 2]} // Responsive to device pixel ratio
          shadows
          data-testid="r3f-canvas"
        >
          {/* Background color */}
          <color attach="background" args={[backgroundColor]} />
          
          {/* Basic lighting */}
          <ambientLight intensity={0.7} />
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={0.5} 
            castShadow 
          />
          
          {/* Performance monitoring in dev mode */}
          {showStats && <Stats />}
          
          {/* Auto-rotation */}
          <AutoRotate enabled={autoRotate} speed={0.5} />
          
          {/* Main content with loading indicator */}
          <Suspense fallback={<LoadingIndicator />}>
            <Bounds fit clip observe margin={1.2}>
              <Model url={modelUrl} />
            </Bounds>
            
            {/* Environment lighting */}
            <Environment preset={environmentPreset} />
          </Suspense>
          
          {/* Interactive controls */}
          <OrbitControls 
            enablePan 
            enableZoom 
            enableRotate 
            minDistance={1.5}
            maxDistance={10}
            dampingFactor={0.05}
            makeDefault
          />
        </Canvas>
      </ErrorBoundary>
      
      {/* UI Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {enableFullscreen && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Preload common 3D models to improve performance
export function preloadModel(url: string) {
  useGLTF.preload(url);
}
