import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { getModelPalette, getLegendSwatches, normalizeModelName } from '@/lib/confusionMatrixPalettes';

interface ConfusionMatrixChartProps {
  confusionMatrix: number[][] | null;
  emotions: string[] | null;
  modelName: string;
  hasActiveDataset?: boolean;
}

/**
 * Validates and clamps percentage values to ensure they're within 0-100% range
 */
function validatePercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Formats percentage value with 2 decimal places for consistency
 */
function formatPercentage(value: number): string {
  return validatePercentage(value).toFixed(2);
}

export function ConfusionMatrixChart({ confusionMatrix, emotions, modelName, hasActiveDataset = true }: ConfusionMatrixChartProps) {
  // Get model-specific palette
  const palette = useMemo(() => getModelPalette(modelName), [modelName]);
  const normalizedModel = useMemo(() => normalizeModelName(modelName), [modelName]);
  const isKnownModel = normalizedModel !== 'unknown';

  // Validate data structure and dimensions
  const isValidData = useMemo(() => {
    if (!confusionMatrix || !emotions || confusionMatrix.length === 0 || emotions.length === 0) {
      return false;
    }
    
    // Check if matrix is square and matches emotions length
    const expectedSize = emotions.length;
    if (confusionMatrix.length !== expectedSize) {
      console.warn('Matrix row count mismatch:', confusionMatrix.length, 'vs', expectedSize);
      return false;
    }
    
    // Check each row has correct number of columns
    for (let i = 0; i < confusionMatrix.length; i++) {
      if (confusionMatrix[i].length !== expectedSize) {
        console.warn('Matrix column count mismatch at row', i, ':', confusionMatrix[i].length, 'vs', expectedSize);
        return false;
      }
    }
    
    return true;
  }, [confusionMatrix, emotions]);

  // Check if data is available - prioritize hasActiveDataset flag and data validation
  const hasData = hasActiveDataset && isValidData;

  // The confusionMatrix is already normalized by backend (percentages per row, each row sums to 100%)
  // Validate all values are within expected range
  const matrix = useMemo(() => {
    if (!hasData || !confusionMatrix) return [];
    return confusionMatrix.map(row => 
      row.map(value => validatePercentage(value))
    );
  }, [confusionMatrix, hasData]);

  // Find max percentage value for color scaling (should be <= 100)
  const maxValue = useMemo(() => {
    if (matrix.length === 0) return 0;
    const max = Math.max(...matrix.flat());
    return Math.min(max, 100); // Ensure max doesn't exceed 100%
  }, [matrix]);

  /**
   * Get continuous gradient cell style for any model
   */
  const getCellStyle = (value: number): React.CSSProperties => {
    const intensity = value / 100;
    
    // Very low values get neutral background
    if (intensity < 0.05) {
      return {
        backgroundColor: 'var(--muted)',
        opacity: 0.3,
      };
    }
    
    // Create continuous gradient using color-mix
    const startWeight = (1 - intensity) * 100;
    const endWeight = intensity * 100;
    
    return {
      background: `color-mix(in oklch, ${palette.gradientStart} ${startWeight}%, ${palette.gradientEnd} ${endWeight}%)`,
    };
  };

  /**
   * Get text color based on background intensity for optimal readability
   * Uses intensity-aware switching with subtle text shadow for mid-range values
   */
  const getTextColor = (value: number): string => {
    const intensity = value / 100;
    
    // For very light backgrounds, use dark text
    if (intensity < 0.4) {
      return 'text-foreground';
    }
    
    // For very dark backgrounds, use light text
    if (intensity > 0.75) {
      return 'text-primary-foreground drop-shadow-sm';
    }
    
    // Mid-range: use foreground with subtle shadow for better contrast
    return 'text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
  };

  // Translate emotion labels to Indonesian
  const translateEmotion = (emotion: string): string => {
    const translations: Record<string, string> = {
      'interest': 'Minat',
      'trust': 'Kepercayaan',
      'fear': 'Ketakutan',
      'skepticism': 'Skeptisisme',
      'satisfaction': 'Kepuasan',
    };
    return translations[emotion.toLowerCase()] || emotion;
  };

  // Show empty state if no data or no active dataset
  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-primary" />
            Confusion Matrix - {modelName}
          </CardTitle>
          <CardDescription>
            Matriks kebingungan menampilkan prediksi vs label aktual (persentase per baris = 100%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
              <p className="text-sm text-muted-foreground/70">
                {!hasActiveDataset 
                  ? 'Upload dataset untuk melihat confusion matrix'
                  : 'Data confusion matrix tidak tersedia atau tidak valid'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // At this point, we know emotions and confusionMatrix are not null due to hasData check
  // Create safe references for TypeScript
  const safeEmotions = emotions!;
  const safeMatrix = matrix;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5 text-primary" />
          Confusion Matrix - {modelName}
        </CardTitle>
        <CardDescription>
          Matriks kebingungan menampilkan prediksi vs label aktual (persentase per baris = 100%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Axis labels */}
            <div className="mb-4 flex items-center justify-center gap-8">
              <div className="text-sm font-semibold text-muted-foreground">
                ← Aktual
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                Prediksi →
              </div>
            </div>
            
            {/* Matrix table */}
            <div className="mx-auto w-fit">
              <table className="border-collapse border-2 border-border shadow-md">
                <thead>
                  <tr>
                    {/* Empty corner cell */}
                    <th className="border-2 border-border bg-muted/50 p-2"></th>
                    {/* Column headers (Predicted) */}
                    {safeEmotions.map((emotion) => (
                      <th
                        key={`header-${emotion}`}
                        className="border-2 p-3 text-center text-xs font-semibold transition-colors"
                        style={{
                          minWidth: '95px',
                          backgroundColor: palette.labelBg,
                          borderColor: palette.labelBorder,
                        }}
                      >
                        {translateEmotion(emotion)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {safeMatrix.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {/* Row header (Actual) */}
                      <th
                        className="border-2 p-3 text-right text-xs font-semibold transition-colors"
                        style={{
                          minWidth: '95px',
                          backgroundColor: palette.labelBg,
                          borderColor: palette.labelBorder,
                        }}
                      >
                        {translateEmotion(safeEmotions[rowIndex])}
                      </th>
                      
                      {/* Matrix cells */}
                      {row.map((value, colIndex) => {
                        const isCorrect = rowIndex === colIndex;
                        
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="group relative border-2 p-0 transition-all duration-200 hover:z-10 hover:scale-105 hover:shadow-lg"
                            style={{
                              minWidth: '95px',
                              minHeight: '95px',
                              borderColor: isCorrect ? palette.labelBorder : 'var(--border)',
                              borderWidth: isCorrect ? '3px' : '2px',
                            }}
                          >
                            <div
                              className="flex h-full w-full items-center justify-center p-4 transition-all duration-200"
                              style={getCellStyle(value)}
                              title={`Aktual: ${translateEmotion(safeEmotions[rowIndex])}\nPrediksi: ${translateEmotion(safeEmotions[colIndex])}\nPersentase: ${formatPercentage(value)}%`}
                            >
                              <div className={`text-base font-bold transition-all ${getTextColor(value)}`}>
                                {formatPercentage(value)}%
                              </div>
                            </div>
                            
                            {/* Hover tooltip */}
                            <div 
                              className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-xs shadow-xl group-hover:block"
                              style={{
                                backgroundColor: palette.tooltipBg,
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: palette.tooltipBorder,
                              }}
                            >
                              <div className="font-semibold text-foreground">
                                Aktual: {translateEmotion(safeEmotions[rowIndex])}
                              </div>
                              <div className="font-semibold text-foreground">
                                Prediksi: {translateEmotion(safeEmotions[colIndex])}
                              </div>
                              <div 
                                className="mt-1 font-bold"
                                style={{ color: palette.tooltipAccent }}
                              >
                                Persentase: {formatPercentage(value)}%
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div 
                  className="h-4 w-4 rounded border-2 bg-muted/50"
                  style={{ borderColor: palette.labelBorder }}
                ></div>
                <span>Prediksi benar (diagonal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {getLegendSwatches(modelName).map((swatch, idx) => (
                    <div 
                      key={idx}
                      className="h-4 w-4 rounded border border-border shadow-sm" 
                      style={{ 
                        background: `color-mix(in oklch, ${palette.gradientStart} ${swatch.start}%, ${palette.gradientEnd} ${swatch.end}%)` 
                      }}
                    ></div>
                  ))}
                </div>
                <span>{palette.legendLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
