/**
 * Shared utilities for visualization state management and data sanitization
 */

export type VisualizationState = 
  | { status: 'loading' }
  | { status: 'no-dataset' }
  | { status: 'insufficient-data'; message?: string }
  | { status: 'ready' };

/**
 * Determine visualization state based on documents and derived data
 */
export function getVisualizationState(
  hasDocuments: boolean,
  hasDerivedData: boolean,
  insufficientMessage?: string
): VisualizationState {
  if (!hasDocuments) {
    return { status: 'no-dataset' };
  }
  if (!hasDerivedData) {
    return { status: 'insufficient-data', message: insufficientMessage };
  }
  return { status: 'ready' };
}

/**
 * Safely coerce a value to a finite number, returning fallback if invalid
 */
export function toFiniteNumber(value: unknown, fallback: number = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sanitize chart data to ensure all numeric values are finite
 */
export function sanitizeChartData<T extends Record<string, unknown>>(
  data: T[],
  numericKeys: (keyof T)[]
): T[] {
  return data.map(item => {
    const sanitized = { ...item };
    numericKeys.forEach(key => {
      sanitized[key] = toFiniteNumber(item[key], 0) as T[keyof T];
    });
    return sanitized;
  });
}

/**
 * Safe array access with bounds checking
 */
export function safeArrayAccess<T>(
  array: T[] | undefined | null,
  index: number,
  fallback: T
): T {
  if (!array || index < 0 || index >= array.length) {
    return fallback;
  }
  return array[index];
}

/**
 * Safe 2D array access with bounds checking
 */
export function safe2DArrayAccess(
  matrix: number[][] | undefined | null,
  row: number,
  col: number,
  fallback: number = 0
): number {
  if (!matrix || row < 0 || row >= matrix.length) {
    return fallback;
  }
  const rowData = matrix[row];
  if (!rowData || col < 0 || col >= rowData.length) {
    return fallback;
  }
  return toFiniteNumber(rowData[col], fallback);
}

/**
 * Validate matrix dimensions
 */
export function validateMatrixDimensions(
  matrix: unknown[][] | undefined | null,
  expectedRows: number,
  expectedCols: number
): boolean {
  if (!matrix || matrix.length !== expectedRows) {
    return false;
  }
  return matrix.every(row => Array.isArray(row) && row.length === expectedCols);
}

/**
 * Normalize emotion label to English (backend format)
 */
export function normalizeEmotionLabel(emotion: string): string {
  const emotionMap: Record<string, string> = {
    'minat': 'interest',
    'kepercayaan': 'trust',
    'ketakutan': 'fear',
    'skeptisisme': 'skepticism',
    'kepuasan': 'satisfaction',
    'interest': 'interest',
    'trust': 'trust',
    'fear': 'fear',
    'skepticism': 'skepticism',
    'satisfaction': 'satisfaction',
  };
  return emotionMap[emotion.toLowerCase()] || emotion;
}

/**
 * Get display label for emotion (Indonesian)
 */
export function getEmotionDisplayLabel(emotion: string): string {
  const displayMap: Record<string, string> = {
    'interest': 'Minat',
    'trust': 'Kepercayaan',
    'fear': 'Ketakutan',
    'skepticism': 'Skeptisisme',
    'satisfaction': 'Kepuasan',
    'minat': 'Minat',
    'kepercayaan': 'Kepercayaan',
    'ketakutan': 'Ketakutan',
    'skeptisisme': 'Skeptisisme',
    'kepuasan': 'Kepuasan',
  };
  return displayMap[emotion.toLowerCase()] || emotion;
}

/**
 * Canonical emotion category list in consistent order
 */
export const CANONICAL_EMOTIONS = ['interest', 'trust', 'fear', 'skepticism', 'satisfaction'] as const;

/**
 * Aggregate normalized emotion totals from documents
 * Returns a map of normalized emotion -> count
 */
export function aggregateEmotionTotals(
  documents: { content: string }[],
  mockAnalysisFn: (content: string) => { primaryEmotion: string }
): Record<string, number> {
  const emotionCounts: Record<string, number> = {};
  
  documents.forEach((doc) => {
    const analysis = mockAnalysisFn(doc.content);
    const normalizedEmotion = normalizeEmotionLabel(analysis.primaryEmotion);
    emotionCounts[normalizedEmotion] = (emotionCounts[normalizedEmotion] || 0) + 1;
  });

  return emotionCounts;
}
