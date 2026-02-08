# Specification

## Summary
**Goal:** Allow users to upload CSV/JSON datasets with the exact schema `ID, Date, Region, Source, User, text, Aspect_Category, Keywords_Extracted` and ingest each row as a separate document reliably.

**Planned changes:**
- Update CSV upload validation to accept a header row matching `ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted` (case-insensitive, whitespace-tolerant) and show clear errors when parsing/validation fails.
- Update JSON upload validation to accept an array of objects whose keys match `ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted` (case-insensitive) and show clear errors when parsing/validation fails.
- For valid CSV/JSON uploads, split the dataset into multiple documents and upload one backend document per row using the row’s `text` as `Document.content`.
- Enforce required `text` field/column: block upload with a clear error if missing; skip rows with empty `text` while completing the upload and show a warning with the number of skipped rows.
- Improve debuggability of multi-row uploads by reporting per-upload success/failure counts (and not silently failing).
- Preserve existing behavior: `.txt` uploads still create a single document; file input continues to allow `.txt`, `.csv`, `.json`.

**User-visible outcome:** Users can upload properly formatted CSV/JSON datasets without unexpected failures; each valid row becomes its own document, dashboards update automatically, and the UI clearly reports parsing issues, validation errors, skipped rows, and partial upload failures.
