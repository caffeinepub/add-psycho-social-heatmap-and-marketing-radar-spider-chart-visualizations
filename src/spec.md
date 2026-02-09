# Specification

## Summary
**Goal:** Update the main navigation header to use a full-width blue gradient background while keeping it sticky, blurred, and bordered, and ensure all header content remains readable.

**Planned changes:**
- Replace the current semi-transparent header background styling in `frontend/src/components/Header.tsx` with Tailwind blue-toned gradient classes that span the full viewport width in both light and dark mode.
- Adjust header foreground styles (brand/title, navigation buttons including hover/active states, theme toggle, and mobile sheet trigger) to maintain strong contrast and clear legibility on the new gradient without editing any `frontend/src/components/ui` files.

**User-visible outcome:** The app header displays a full-width blue gradient background with readable navigation and controls across desktop/mobile and in both light and dark themes.
