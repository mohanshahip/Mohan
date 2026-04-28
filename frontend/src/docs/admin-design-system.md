# Admin Panel Design System & Layout Specifications

This document outlines the standardized layout system and UI/UX standards for the admin panel.

## 1. Grid & Spacing System

The admin panel follows a strict 8px spacing scale defined in `Layout-variable.css`.

- **Base Unit**: 4px / 8px
- **Standard Spacing**:
  - `var(--space-1)`: 4px
  - `var(--space-2)`: 8px
  - `var(--space-4)`: 16px (Standard gap)
  - `var(--space-6)`: 24px (Standard section gap)
  - `var(--space-8)`: 32px (Page padding)

## 2. Layout Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| XS | 320px | Small mobile devices |
| SM | 768px | Tablets (Sidebar collapses) |
| MD | 1024px | Small desktops / Large tablets |
| LG | 1440px | Standard desktops (Max content width) |

## 3. Reusable Layout Templates

### Standard Page Layout (`AdminPageLayout`)
Used for most admin pages.
- **Max Width**: 1440px
- **Padding**: 32px
- **Centering**: Automatic `margin: 0 auto`

### Narrow Page Layout (`AdminPageLayout narrow={true}`)
Used for forms, profile, and settings to prevent overly long line lengths.
- **Max Width**: 1000px
- **Centering**: Automatic `margin: 0 auto`

### Form Grid (`admin-form-grid`)
A two-column layout for complex forms.
- **Left Column**: `1fr` (Main content)
- **Right Column**: `300px` (Sidebar actions/info)
- **Gap**: 32px (`var(--page-sidebar-gap)`)

## 4. Component Standards

### Interactive Elements
- **Buttons**: Use `.btn-admin` with modifiers like `--primary`, `--secondary`, `--danger`.
- **Inputs**: Use `.admin-form-control`. Use `.admin-input-icon-wrapper` for inputs with icons.
- **Selects**: Use the `CustomSelect` component for a consistent look.

### Feedback & States
- **Loading**: Use `LoadingSpinner` component (fullPage for overlays).
- **Alerts**: Use `AdminAlert` component for in-page messages.
- **Notifications**: Use `useToast` for temporary feedback.
- **Confirmations**: Use `useConfirm` hook for modal-based confirmations.

## 5. Visual Hierarchy & Aesthetics
- **Shadows**: Use standardized shadows (`--shadow-sm` to `--shadow-xl`).
- **Radii**: Use standardized border radii (`--radius-md` for buttons, `--radius-xl` for cards/sections).
- **Transitions**: All interactive elements must use `var(--admin-transition)` for smooth feedback.
