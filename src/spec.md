# Specification

## Summary
**Goal:** Improve dataset/document upload failure handling so Internet Computer replica rejections for a stopped canister (IC0508 / reject_code 5) show a clear English message while preserving and displaying the original technical rejection details.

**Planned changes:**
- Detect replica rejections indicating “canister is stopped” (IC0508 / reject_code 5) during dataset (CSV/JSON batch) and single-document uploads, and show a clear English user-facing error explaining the backend is unavailable and the user cannot fix it from the UI (try again later / contact administrator).
- Preserve original replica rejection error metadata when propagating errors from upload-related mutations so canister-stopped detection remains reliable (avoid replacing with generic errors that drop reject_code/error_code).
- Improve upload error detail formatting for DatasetUploadStatus and console logs to include a readable multi-line block with relevant fields when present (error_code, reject_code, reject_message, and any available request/canister identifiers).

**User-visible outcome:** When uploads fail because the target canister is stopped, users see an English explanation that the backend is unavailable (and what to do next), while operators can still view the original technical rejection details in the error panel and console for debugging.
