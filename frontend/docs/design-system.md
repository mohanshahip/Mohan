# Design System: Global Design Language and Responsiveness

## Core Principles

- Single source of truth via CSS variables in `src/styles/global.css`.
- Consistent components: cards, buttons, inputs, modals, and page controls share base patterns.
- Accessibility and performance are first‑class: focus management, keyboard support, lazy loading, and CLS prevention.

## Tokens and Variables

- Colors: Use `--primary-*`, `--gray-*`, `--success`, `--warning`, `--error` exclusively.
- Typography:
  - Families: `--font-family-base`, `--font-family-nepali`, `--font-family-monospace`
  - Scale: `--font-size-*`, `--leading-*`, `--tracking-*`
- Spacing: `--space-*` (base 4px) and `--spacing-*` aliases.
- Radius & Shadows: `--radius-*`, `--shadow-*`.
- Layout: `--content-max-width`, container paddings, and section spacing.

## Cards

- Base: `.content-card` (applied in markup or inherited styles)
  - Idle: `--radius-xl`, `--shadow-sm`
  - Hover: `--shadow-lg`, translateY(-4px)
- Image containers: aspect‑ratio enforced (`16/9` for projects, `4/3` for gallery), `object-fit: cover`.
- Padding: body uses `--spacing-xl`, footer uses `--spacing-md`.

## Buttons

- Primary: `--primary-gradient`, white text, `--radius-lg`, hover shadow with `--shadow-*`.
- Secondary: outline with `--border-color` and `--surface`.
- Icon buttons: circular, min‑size 44×44px.

## Inputs

- Use `.form-input`, `.form-select` from `global.css` (consistent height `--control-height`, border, and focus ring).

## Modals

- Shared patterns:
  - Overlay with `backdrop-filter: blur()`
  - Rounded corners `--radius-2xl`
  - Sticky header/footer, scrollable body.
  - Focus trap and keyboard navigation (Esc to close).
  - Mobile bottom‑sheet style with full‑height option.

## Breakpoints & Fluid Scaling

Custom properties defined in `global.css`:

- `--bp-mobile`: 480px
- `--bp-tablet`: 768px
- `--bp-desktop`: 1024px
- `--bp-wide`: 1280px
- `--bp-ultrawide`: 1536px

Note: CSS custom properties are not yet widely supported inside `@media` queries. We standardize around the thresholds above in media queries and keep variable names in documentation for consistency. Fluid sizing uses `clamp()` for typography, paddings, and component dimensions.

### Example Patterns

- Title: `font-size: clamp(2rem, 2.2vw, 3.2rem)`
- Modal width (wide): `width: clamp(1100px, 75vw, 1400px)`
- Modal width (ultrawide): `width: clamp(1200px, 65vw, 1600px)`
- Column gaps: `column-gap: clamp(1.5rem, 2.5vw, 3rem)`

## Accessibility (WCAG 2.1 AA)

- Semantics: Use `<section>`, `<article>`, `<nav>`, etc., with correct heading hierarchy.
- Focus: Visible `:focus-visible` outline with `--primary-color`.
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, and return focus on close.
- Keyboard: Arrow keys for galleries; Esc to close; Tab cycles within modal content.
- Reduced Motion: Disable non‑essential animations under `@media (prefers-reduced-motion: reduce)`.
- Contrast: All text uses `--text-*` for AA compliance.

## Performance

- Images: `loading="lazy"`, `sizes` hints, aspect‑ratio containers to prevent CLS.
- CSS/JS: Production build via Vite; avoid `@import` chains; defer noncritical work.
- Rendering: Consider `content-visibility: auto` for large grids.

## Testing Matrix

- Devices: iOS Safari (iPhone 12+), Android Chrome (Pixel, Galaxy), iPad Safari/Chrome, Desktop Chrome/Firefox/Safari/Edge.
- Viewports: 360×640, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440.
- Checks:
  - No horizontal overflow; images constrained to parent.
  - Sticky header/footer; body scroll within modal.
  - Buttons ≥44×44px; visible focus states.
  - Lazy loading and skeletons where applicable.
  - Language switch without layout jumps (use layout freeze utilities).

## Roadmap (Implementation)

1. Audit current pages to replace ad‑hoc styles with tokenized variables.
2. Ensure all cards use `.content-card` or inherit its base visual style.
3. Unify modals (Gallery, Projects, Skills) to the shared pattern.
4. Replace pixel paddings and sizes with `rem`/`%`/`clamp()`.
5. Validate with Lighthouse (≥90 across categories), address any a11y and CLS warnings.
6. Cross‑browser and device tests; capture issues and fix iteratively.

## Notes

- Use `color-mix()` with variables for translucent overlays, e.g. `color-mix(in srgb, var(--gray-900) 70%, transparent)`.
- Prefer `clamp()` over multiple breakpoint overrides when appropriate to reduce CSS complexity.
