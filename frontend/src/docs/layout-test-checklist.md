# Layout Test Checklist

## Quick Smoke Test (2 minutes)
- [ ] Load public home page - navbar visible
- [ ] Load admin dashboard - sidebar visible, no navbar
- [ ] Click menu toggle - sidebar collapses/expands
- [ ] Resize browser - layout adapts correctly

## Desktop (≥1024px)
- [ ] Navbar visible on public pages
- [ ] Admin sidebar visible and collapsible
- [ ] Topbar fixed at top, doesn't scroll away
- [ ] Content doesn't hide behind topbar
- [ ] No horizontal scrollbars
- [ ] Click notifications - dropdown appears
- [ ] Click user menu - dropdown appears
- [ ] Click language toggle - switches language
- [ ] Click theme toggle - switches theme

## Tablet (768px - 1023px)
- [ ] Mobile navbar menu works (hamburger icon)
- [ ] Admin sidebar hidden by default
- [ ] Click menu toggle shows sidebar
- [ ] Topbar height adjusts correctly (64px)
- [ ] Dropdowns fit within viewport
- [ ] Search bar accessible
- [ ] Click outside dropdowns closes them

## Mobile (< 768px)
- [ ] Touch targets ≥44px
- [ ] No content cut off on edges
- [ ] Language toggle works
- [ ] Theme toggle works
- [ ] Mobile menu opens/closes smoothly
- [ ] Can't scroll page when menu is open
- [ ] Topbar height adjusts (60px)

## RTL Support
- [ ] Switch to Nepali (RTL language)
- [ ] Text direction correct (right-aligned)
- [ ] Sidebar positioned on right
- [ ] Breadcrumb arrows reversed
- [ ] Icons positioned correctly

## Dark Mode
- [ ] Colors consistent across components
- [ ] Text has sufficient contrast
- [ ] No flash of light mode on load
- [ ] Icons adapt to dark mode

## Performance
- [ ] No layout shift on page load
- [ ] Language switch doesn't cause jump
- [ ] Resize doesn't cause flicker
- [ ] Mobile menu opens instantly