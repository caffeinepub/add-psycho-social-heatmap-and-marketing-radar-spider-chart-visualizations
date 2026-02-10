/**
 * Confusion Matrix Palette Utilities
 * Maps model names to their specific color palettes and provides
 * consistent styling configuration across all confusion matrix visualizations.
 */

export interface ModelPalette {
  gradientStart: string;
  gradientEnd: string;
  labelBg: string;
  labelBorder: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipAccent: string;
  legendLabel: string;
}

/**
 * Normalizes model name to standard format
 */
export function normalizeModelName(modelName: string): 'BERT' | 'RoBERTa' | 'DistilBERT' | 'unknown' {
  const normalized = modelName.toUpperCase().trim();
  
  if (normalized === 'BERT') return 'BERT';
  if (normalized === 'ROBERTA') return 'RoBERTa';
  if (normalized === 'DISTILBERT') return 'DistilBERT';
  
  return 'unknown';
}

/**
 * Returns CSS variable names for the specified model's palette
 */
export function getModelPalette(modelName: string): ModelPalette {
  const model = normalizeModelName(modelName);
  
  switch (model) {
    case 'BERT':
      return {
        gradientStart: 'var(--bert-matrix-green)',
        gradientEnd: 'var(--bert-matrix-yellow)',
        labelBg: 'var(--bert-matrix-label-bg)',
        labelBorder: 'var(--bert-matrix-label-border)',
        tooltipBg: 'var(--bert-matrix-tooltip-bg)',
        tooltipBorder: 'var(--bert-matrix-tooltip-border)',
        tooltipAccent: 'var(--bert-matrix-tooltip-accent)',
        legendLabel: 'Intensitas: hijau (rendah) → kuning (tinggi)',
      };
    
    case 'RoBERTa':
      return {
        gradientStart: 'var(--roberta-matrix-blue)',
        gradientEnd: 'var(--roberta-matrix-purple)',
        labelBg: 'var(--roberta-matrix-label-bg)',
        labelBorder: 'var(--roberta-matrix-label-border)',
        tooltipBg: 'var(--roberta-matrix-tooltip-bg)',
        tooltipBorder: 'var(--roberta-matrix-tooltip-border)',
        tooltipAccent: 'var(--roberta-matrix-tooltip-accent)',
        legendLabel: 'Intensitas: biru (rendah) → ungu (tinggi)',
      };
    
    case 'DistilBERT':
      return {
        gradientStart: 'var(--distilbert-matrix-orange)',
        gradientEnd: 'var(--distilbert-matrix-red)',
        labelBg: 'var(--distilbert-matrix-label-bg)',
        labelBorder: 'var(--distilbert-matrix-label-border)',
        tooltipBg: 'var(--distilbert-matrix-tooltip-bg)',
        tooltipBorder: 'var(--distilbert-matrix-tooltip-border)',
        tooltipAccent: 'var(--distilbert-matrix-tooltip-accent)',
        legendLabel: 'Intensitas: oranye (rendah) → merah (tinggi)',
      };
    
    default:
      // Fallback for unknown models
      return {
        gradientStart: 'var(--primary)',
        gradientEnd: 'var(--primary)',
        labelBg: 'var(--muted)',
        labelBorder: 'var(--border)',
        tooltipBg: 'var(--popover)',
        tooltipBorder: 'var(--border)',
        tooltipAccent: 'var(--primary)',
        legendLabel: 'Intensitas persentase (0-100%)',
      };
  }
}

/**
 * Generates legend swatches for the model's gradient
 * Returns an array of color-mix percentages for visual preview
 */
export function getLegendSwatches(modelName: string): Array<{ start: number; end: number }> {
  return [
    { start: 100, end: 0 },   // 100% start color
    { start: 66, end: 34 },   // 66% start, 34% end
    { start: 33, end: 67 },   // 33% start, 67% end
    { start: 0, end: 100 },   // 100% end color
  ];
}
