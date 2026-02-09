/**
 * Client-side PDF export helper for Strategic Recommendation Report
 * Uses browser's print-to-PDF functionality with existing print styles
 */

export interface PdfExportOptions {
  filename?: string;
  locale?: 'en' | 'id';
}

/**
 * Triggers browser print dialog for PDF export
 * The report content is already styled for print via @media print rules in index.css
 */
export function exportReportAsPdf(options: PdfExportOptions = {}): void {
  const { filename = 'strategic-report', locale = 'en' } = options;
  
  // Verify report container exists
  const reportContainer = document.querySelector('.report-container');
  if (!reportContainer) {
    console.warn('Report container not found. Cannot export PDF.');
    return;
  }

  // Set document title for PDF filename suggestion
  const originalTitle = document.title;
  const timestamp = new Date().toISOString().split('T')[0];
  document.title = `${filename}-${timestamp}`;

  // Trigger print dialog
  // Modern browsers allow "Save as PDF" as a print destination
  window.print();

  // Restore original title after a short delay
  setTimeout(() => {
    document.title = originalTitle;
  }, 100);
}

/**
 * Check if PDF export is available (report content exists)
 */
export function isPdfExportAvailable(): boolean {
  return !!document.querySelector('.report-container');
}
