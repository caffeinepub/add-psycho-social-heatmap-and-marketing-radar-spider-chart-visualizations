# Specification

## Summary
**Goal:** Automatically complete missing Purchase Intention fields (`intention_score`, `intention_level`) during dataset upload and ensure reports/pages use these derived values.

**Planned changes:**
- Extend frontend dataset ingestion for CSV/JSON to detect `intention_score` and `intention_level` with case-insensitive, whitespace-tolerant header/key matching.
- When one or both fields are missing, deterministically derive per-row `intention_score` (0–100 integer) and `intention_level` (`low|medium|high`) from each row’s text/content during ingestion.
- Add a deterministic frontend utility under `frontend/src/lib` to compute `{ intention_score, intention_level }` with clamping, validation, and documented thresholds.
- Update Strategic Recommendation Report generation to treat Purchase Intention as available when provided or derived, and remove the “Purchase Intention data not available” note in that case (English UI text).
- Update the Purchase Intention page and charts to render using derived intention values (with standard loading/empty/insufficient/ready states) without requiring any backend schema changes.

**User-visible outcome:** Users can upload datasets that do not include Purchase Intention columns and still see populated Purchase Intention charts and report sections based on deterministically derived intention values.
