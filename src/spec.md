# Specification

## Summary
**Goal:** Add an English/Bahasa Indonesia toggle to the Strategic Recommendation Report so the entire report UI, generated narrative content, and exports can be switched between the two languages.

**Planned changes:**
- Add an explicit language selection control (English / Bahasa Indonesia) on the StrategicRecommendationReportPage.
- Localize all visible UI text on the Strategic Recommendation Report page (headings, descriptions, buttons, badges, notices, loading/empty states) based on the selected language.
- Update report generation and export utilities to support a language/locale parameter for bilingual, deterministic report content and fully localized Markdown output (including priority labels).
- Apply locale-appropriate date formatting for the “Generated on” timestamp based on the selected language, and ensure behavior is consistent across loading, empty, and data-present states.
- Ensure Print and Copy-as-Markdown continue to work with the selected language without requiring a page refresh.

**User-visible outcome:** Users can toggle the Strategic Recommendation Report between English and Bahasa Indonesia, with the entire on-page report, timestamps, and Markdown export updating immediately while print/copy features continue to work.
