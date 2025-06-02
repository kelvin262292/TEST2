# UI/UX Wireframes & Design System  
Modern 3D E-commerce Platform  
Author: Dennis Smith (Product Manager)  
Last updated: 2025-06-02  

---

## 1  Design System Foundation  

### 1.1  Color Palette  

Role | Token | Hex | Notes
---- | ----- | --- | -----
Primary | `--color-primary` | `#0066FF` | Brand blue
Primary-Dark | `--color-primary-600` | `#0047B3` | Hover / focus
Secondary | `--color-secondary` | `#FF6600` | Accent, CTAs
Neutral-100 | `--color-grey-100` | `#FFFFFF` | Background
Neutral-200 | `--color-grey-200` | `#F5F7FA` | Sub-bg
Neutral-400 | `--color-grey-400` | `#A0AEC0` | Borders, disabled
Neutral-700 | `--color-grey-700` | `#2D3748` | Body text
Success | `--color-success` | `#2DB47D` | Status
Error | `--color-error` | `#E53E3E` | Form errors  

Contrast checked to meet WCAG 2.1 AA (≥ 4.5:1 for body, 3:1 for large).

### 1.2  Typography  

Step | Token | Size (px rem) | Weight | Usage
---- | ----- | ------------- | ------ | -----
H1 | `--fs-900` | 48 / 3rem | 700 | Hero headings
H2 | `--fs-800` | 36 / 2.25rem | 700 | Section titles
H3 | `--fs-700` | 28 / 1.75rem | 600 | Card titles
Body-L | `--fs-600` | 18 / 1.125rem | 400 | Long-form text
Body-M | `--fs-500` | 16 / 1rem | 400 | Default text
Caption | `--fs-400` | 14 / 0.875rem | 400 | Meta info  

Font family: `Inter, system-ui, sans-serif`; fallback: `Helvetica Neue`.

### 1.3  Spacing Scale  

Token | Rem | Px
----- | --- | --
`--space-1` | 0.25 | 4
`--space-2` | 0.5 | 8
`--space-3` | 0.75 | 12
`--space-4` | 1 | 16
`--space-5` | 1.5 | 24
`--space-6` | 2 | 32
`--space-8` | 3 | 48
`--space-10` | 4 | 64

Grid: 12-col, 72 rem max width, 24 px gutters. Mobile uses 4-col grid 16 px gutters.

---

## 2  Component Library Specifications  

Component | Variants | Props / States | Notes
--------- | -------- | -------------- | -----
Button | primary, secondary, icon, ghost | `size` (sm/md/lg), `disabled`, `loading` | 44 px min height
Input | text, password, textarea | `error`, `success`, `iconLeft` | Inline validation
Card | product, order, stat | `elevation` (0–3) | Uses 8 px radius
Badge | status, quantity | `color` (grey, primary, success, error) | 16 px radius pill
Modal | default, full-screen | `isOpen`, `onClose` | ARIA role `dialog`
Navbar | desktop, mobile | `sticky`, `cartCount` | Collapses to hamburger
Sidebar (Admin) | expanded, collapsed | `activePath` | 64 px icon rail collapsed
Toast | success, error, info | auto-dismiss | Live region `aria-live="assertive"`

Components stored in **packages/shared/ui**; documented with Storybook.

---

## 3  Page Layouts & Wireframes  

### 3.1  Product Listing  

Sections:  
1. Global header (search, cart, user)  
2. Left filter drawer (category, price slider, brand checkboxes)  
3. Grid of product cards (3-col desktop, 2-col tablet, 1-col mobile)  
4. Pagination / infinite scroll  

Each card: thumbnail, quick-view button, price, rating stars.

### 3.2  Product Detail  

1. Breadcrumb → back link  
2. Hero split 70/30: left 3D Viewer, right product info  
3. Variant selector (color swatches)  
4. Quantity stepper → Add to Cart CTA  
5. Accordion tabs (Description, Specs, Reviews)  
6. Related products carousel  

3D viewer sticky on scroll > 1024 px.

### 3.3  Cart  

• Table layout on desktop; stacked cards on mobile  
• Summary sidebar (desktop) / bottom sheet (mobile)  
• Promo code input + feedback message  
• CTA: “Checkout Securely”

### 3.4  Checkout  

Steps indicator (Shipping → Payment → Review).  
Progressive disclosure: show one step per screen on mobile.  
Form guidelines: 2-col grid desktop, 1-col mobile.  
Payment methods cards (credit card, PayPal, Apple Pay).  

### 3.5  Admin Dashboard  

Dashboard Home: KPI cards (sales, orders, top products), line chart, recent orders table.  
Sidebar nav with icons; collapsible groups.  
CRUD pages follow Master–Detail pattern: list table + drawer form.

Wireframes delivered in Figma file `/design/3d-ecommerce.fig`, frames named as above.

---

## 4  Responsive Design Considerations  

Breakpoint | Token | Px
---------- | ----- | --
Mobile | `--bp-sm` | 0–639
Tablet | `--bp-md` | 640–1023
Desktop | `--bp-lg` | 1024–1439
Wide | `--bp-xl` | 1440+

Tech: CSS `clamp()` for fluid typography, Tailwind responsive classes.  
Nav transforms: desktop horizontal → mobile drawer.  
3D Viewer: switches to low-poly model + capped DPR on mobile.  

---

## 5  3D Viewer Integration in UI  

• Placed in dedicated container with 1:1 aspect placeholder to avoid CLS.  
• Loading skeleton shimmer until GLB loaded.  
• Full-screen button toggles modal with `<dialog>` element.  
• Viewer height responsive: `min(60vh, 600px)`.  
• AR quick-look badge (iOS) & QR for Model-Viewer on Android.  

---

## 6  User Journey Flows  

Flow | Steps
---- | -----
Browse → Purchase | Home → Category → Product Detail (+3D) → Add to Cart → Checkout → Confirmation
Guest → Member | Browse → Sign Up modal → Email verify → Profile complete
Admin Add Product | Dashboard → Products → “New” → Upload images + 3D model → Save → Preview

Each flow mapped with Figma prototype links.

---

## 7  Accessibility Guidelines  

WCAG 2.1 AA target.  
• Semantic HTML: use `<button>` not `<div onclick>`.  
• Color contrast ≥ 4.5:1; test with Axe.  
• Keyboard navigation: tab order logical, focus ring visible (`outline-offset:2px`).  
• ARIA labels for 3D viewer controls (`aria-label="Rotate model"`).  
• Prefer `prefers-reduced-motion` query: disable auto-rotate & smooth scroll.  
• Screen-reader live regions for toast / cart badge.  

---

## 8  Design Tokens & Implementation  

Stored as CSS variables & JSON for multi-platform. Example:

```css
:root {
  --color-primary:#0066FF;
  --fs-500:1rem;
  --space-4:1rem;
}
```

File structure:

```
tokens/
  ├── colors.json
  ├── typography.json
  └── spacing.json
```

Pipeline: Style Dictionary → Tailwind config → React Native styles (future).

---

## 9  Interactive States & Animations  

Element | State | Spec
------- | ----- | ----
Button | hover | 4 px translate-up, shadow-md, color darken 10 %
Button | pressed | scale 0.97, shadow-sm
Card | hover (desktop) | shadow-lg + subtle lift (100 ms ease-out)
Accordion | expand/collapse | height auto animation 200 ms
3D Viewer | idle auto-rotate | 0.2 rpm; disable on interaction or `prefers-reduced-motion`

Use `framer-motion` for choreographed transitions; limit total motion to 300 ms to keep UI snappy.

---

## 10  Mobile-First Approach  

1. Designs start at 360×640 viewport, scale up.  
2. Primary actions placed within thumb zone (bottom 48 px).  
3. Sticky minicart summary only on mobile.  
4. Large tap targets: 48 px min.  
5. Lazy-load images (`loading="lazy"`) and use responsive `srcset`.  
6. Prioritize Core Web Vitals (LCP ≤ 2.5 s, CLS < 0.1, INP < 200 ms).  

---

### Next Steps  

* Conduct moderated usability testing with 5 participants on mobile & desktop.  
* Iterate on checkout form autofill & error messaging.  
* Document dark-mode tokens (`--color-grey-100` → `#1A202C` etc.).  

End of document. 
