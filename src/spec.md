# Specification

## Summary
**Goal:** Make dataset uploads more resilient to backend failures by preventing `addCleaningLog` errors from crashing uploads and by showing clear, actionable English errors when the backend canister is stopped (IC0508).

**Planned changes:**
- Update single (`useUploadDocument`) and batch (`useUploadDocumentsBatch`) upload flows to wrap `actor.addCleaningLog(...)` in try/catch so logging failures do not cause unhandled rejections or crash the overall upload.
- Detect canister-stopped replica rejections (e.g., IC0508 / reject message contains “is stopped”) and fail the upload with a clear English error stating the backend canister is stopped and must be started/redeployed before uploads can proceed.
- Improve Dashboard upload error UI so `DatasetUploadStatus` and toast errors show an English summary and include the underlying replica rejection/error message for debugging, and ensure the status reliably transitions to an error state after failures.
- Ensure all newly introduced user-facing strings for these upload-failure cases are in English.

**User-visible outcome:** Uploads no longer fail solely due to `addCleaningLog` issues; when uploads do fail (including canister-stopped cases), the Dashboard clearly shows an English error with the underlying rejection details and does not get stuck in “uploading”.
