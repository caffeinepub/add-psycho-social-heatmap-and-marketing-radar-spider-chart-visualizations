import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

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

  // Get color intensity based on percentage value (0-100 range)
  // Uses normalized intensity (0-1) for consistent color mapping
  const getColorClass = (value: number): string => {
    if (maxValue === 0) return 'bg-muted/20';
    const intensity = value / 100; // Normalize to 0-1 range for color calculation
    
    if (intensity === 0) return 'bg-muted/20';
    if (intensity < 0.15) return 'bg-primary/15';
    if (intensity < 0.30) return 'bg-primary/30';
    if (intensity < 0.50) return 'bg-primary/50';
    if (intensity < 0.70) return 'bg-primary/70';
    if (intensity < 0.85) return 'bg-primary/85';
    return 'bg-primary';
  };

  // Get text color based on background intensity for readability
  const getTextColor = (value: number): string => {
    if (maxValue === 0) return 'text-foreground';
    const intensity = value / 100;
    return intensity > 0.5 ? 'text-primary-foreground' : 'text-foreground';
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
              <table className="border-collapse border-2 border-border">
                <thead>
                  <tr>
                    {/* Empty corner cell */}
                    <th className="border-2 border-border bg-muted/50 p-2"></th>
                    {/* Column headers (Predicted) */}
                    {safeEmotions.map((emotion) => (
                      <th
                        key={`header-${emotion}`}
                        className="border-2 border-border bg-muted/50 p-2 text-center text-xs font-semibold"
                        style={{ minWidth: '90px' }}
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
                        className="border-2 border-border bg-muted/50 p-2 text-right text-xs font-semibold"
                        style={{ minWidth: '90px' }}
                      >
                        {translateEmotion(safeEmotions[rowIndex])}
                      </th>
                      
                      {/* Matrix cells */}
                      {row.map((value, colIndex) => {
                        const isCorrect = rowIndex === colIndex;
                        
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={`group relative border-2 border-border p-0 transition-all hover:z-10 hover:scale-105 ${isCorrect ? 'border-accent' : ''}`}
                            style={{ minWidth: '90px', minHeight: '90px' }}
                          >
                            <div
                              className={`flex h-full w-full items-center justify-center p-3 ${getColorClass(value)}`}
                              title={`Aktual: ${translateEmotion(safeEmotions[rowIndex])}\nPrediksi: ${translateEmotion(safeEmotions[colIndex])}\nPersentase: ${formatPercentage(value)}%`}
                            >
                              <div className={`text-base font-bold ${getTextColor(value)}`}>
                                {formatPercentage(value)}%
                              </div>
                            </div>
                            
                            {/* Hover tooltip */}
                            <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg group-hover:block">
                              <div className="font-semibold">Aktual: {translateEmotion(safeEmotions[rowIndex])}</div>
                              <div className="font-semibold">Prediksi: {translateEmotion(safeEmotions[colIndex])}</div>
                              <div className="mt-1 text-primary">Persentase: {formatPercentage(value)}%</div>
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
                <div className="h-4 w-4 rounded border-2 border-accent bg-muted"></div>
                <span>Prediksi benar (diagonal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-4 w-4 rounded border border-border bg-primary/15"></div>
                  <div className="h-4 w-4 rounded border border-border bg-primary/50"></div>
                  <div className="h-4 w-4 rounded border border-border bg-primary/85"></div>
                  <div className="h-4 w-4 rounded border border-border bg-primary"></div>
                </div>
                <span>Intensitas persentase (0-100%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
