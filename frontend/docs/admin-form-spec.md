# Admin Form Design Specification

This document defines the standardized design patterns for all forms within the Admin Panel.

## 1. Grid System & Spacing
- **Base Grid**: 8px grid system (using `--space-*` variables from `global.css`).
- **Form Container**: Maximum width of `1200px` for optimal readability.
- **Section Spacing**: `var(--spacing-xl)` (32px) between major form sections.
- **Group Spacing**: `var(--spacing-lg)` (24px) between individual form groups (label + input).
- **Inner Spacing**: `var(--spacing-xs)` (8px) between label and input.

## 2. Form Layout Patterns
### 2.1 Single Column (Simple Forms)
Used for profile settings, simple configuration, or mobile view.
- Max-width: `600px`.
- Centered or left-aligned within the content area.

### 2.2 Two-Column (Complex Content)
Used for Adding/Editing Poems, Projects, etc.
- **Main Column (Left)**: 65-70% width. Contains primary content (Title, Description, Main Text).
- **Sidebar Column (Right)**: 30-35% width. Contains metadata (Category, Tags, Status, Featured Image).
- **Breakpoint**: Stacks to single column at `var(--bp-tablet)` (768px).

## 3. Component Specifications

### 3.1 Input Fields (`.admin-form-control`)
- **Height**: `var(--control-height)` (48px).
- **Border Radius**: `var(--radius-lg)` (12px).
- **Typography**: `var(--font-size-sm)` (14px).
- **Colors**:
  - Background: `var(--background-alt)` (Gray 50).
  - Border: `var(--border-color)` (Gray 200).
  - Text: `var(--text-primary)` (Gray 900).
- **States**:
  - **Hover**: Border becomes `var(--gray-400)`.
  - **Focus**: Border `var(--primary-color)`, shadow `0 0 0 4px color-mix(in srgb, var(--primary-color) 10%, transparent)`.
  - **Disabled**: Opacity `0.6`, cursor `not-allowed`.
  - **Error**: Border `var(--error)`, background `var(--error-light)`.

### 3.2 Labels (`.admin-form-label`)
- **Typography**: `var(--font-size-sm)` (14px), `font-weight: 600`.
- **Color**: `var(--text-secondary)` (Gray 600).
- **Required Indicator**: Red asterisk `*` after the label text.

### 3.3 Buttons (`.btn-admin`)
- **Primary**: `var(--primary-gradient)`, white text, for main actions (Save, Publish).
- **Secondary**: Surface background, gray border, for neutral actions (Cancel, Back).
- **Danger**: Error background/text, for destructive actions (Delete, Remove).
- **Success**: Success background/text, for positive confirmations.
- **Height**: `48px` (Standard), `40px` (Small).
- **Radius**: `var(--radius-lg)` (12px).

### 3.4 Feedback & Validation
- **Success Messages**: Toast notifications or inline alerts using `var(--success)`.
- **Error Messages**: Inline text below the input using `var(--error)`, size `var(--font-size-xs)`.
- **Loading States**: Disable buttons and show `LoadingSpinner` or `Loader` icon.

## 4. Accessibility (WCAG 2.1 AA)
- **Contrast**: All text/background combinations must meet 4.5:1 ratio.
- **Focus States**: Must be clearly visible and navigable via Keyboard (Tab).
- **Form Labels**: Every input must have an associated `<label>` or `aria-label`.
- **Error Description**: Use `aria-invalid="true"` and `aria-describedby` for error messages.
- **Touch Targets**: Buttons and interactive elements must be at least `44x44px`.

## 5. Responsive Breakpoints
- **Desktop (>1024px)**: Full two-column layout where applicable.
- **Tablet (768px - 1024px)**: Adjusted margins, potential single-column transition.
- **Mobile (<768px)**: Single column, full-width inputs, adjusted paddings (`var(--spacing-md)`).
