# Specification

## Summary
**Goal:** Ensure all existing dashboard and report visualizations render reliably whenever uploaded documents exist, with consistent empty/insufficient-data handling and correct updates after uploads/deletions.

**Planned changes:**
- Audit all visualization components (EmotionDistributionChart, BrandEmotionChart, GenderEmotionChart, GeoEmotionMap, PsychoSocialHeatmap, MarketingRadarChart) to eliminate incorrect “no active data” empty-states when documents exist and prevent blank renders caused by missing props or stale dataset detection.
- Standardize dataset-availability and data-shape validation across all visualization components to handle loading, no dataset, dataset present but metric not computable, and valid metric states without runtime errors (including guards against undefined/null/empty inputs and invalid chart values).
- Fix React Query invalidation/refetch flows so pages with visualizations (Dashboard, Analysis, Metrics, Purchase Intention, Strategic Recommendation Report) update immediately and consistently after document uploads or deletions, without manual refresh.

**User-visible outcome:** After uploading (or deleting) documents, all charts/visualizations and the Strategic Recommendation Report update immediately and render reliably; when a metric can’t be computed, the UI shows a clear “insufficient data” message instead of an incorrect empty dataset state, and no visualization crashes or renders blank due to stale data.
