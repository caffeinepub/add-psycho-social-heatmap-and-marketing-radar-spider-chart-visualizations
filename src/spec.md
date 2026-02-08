# Specification

## Summary
**Goal:** Add a new Marketing Mix radar chart (8 fixed factors) to the Dashboard, computed deterministically on the frontend from uploaded documents.

**Planned changes:**
- Add a deterministic frontend utility under `frontend/src/lib` to aggregate and normalize document-derived scores into exactly 8 ordered factors (PROD, PRICE, DIST, COMM, HRD, CUSJ, BRAND, COLLAB), each clamped to 0–100.
- Create `frontend/src/components/MarketingMixRadarChart.tsx` to render the 8-factor radar chart and follow existing visualization states (empty/idle, insufficient data, ready) with all English UI text and factor code + full name exposed via tooltip/legend/help.
- Integrate `MarketingMixRadarChart` into `frontend/src/pages/Dashboard.tsx` as a new section/card, wired to the existing `documents` and `hasActiveDataset` so it updates when documents change.

**User-visible outcome:** The Dashboard shows an additional Marketing Mix radar chart with 8 labeled axes (0–100) that updates immediately based on the currently uploaded documents and provides clear English explanations for each factor code.
