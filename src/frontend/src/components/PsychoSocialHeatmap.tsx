import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle } from 'lucide-react';
import type { Document } from '../backend';
import { computePsychoSocialMatrix } from '../lib/psychoSocialMetrics';
import { useMemo } from 'react';
import { getVisualizationState, safe2DArrayAccess, validateMatrixDimensions } from '../lib/visualizationState';

interface PsychoSocialHeatmapProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

const dimensions = ['Trust', 'Anxiety', 'Excitement', 'Social Influence', 'Self-Efficacy', 'Risk Perception'];
const emotions = ['Interest', 'Trust', 'Fear', 'Skepticism', 'Satisfaction'];

export function PsychoSocialHeatmap({ documents, hasActiveDataset = true }: PsychoSocialHeatmapProps) {
  // Compute psycho-social matrix
  const matrix = useMemo(() => {
    if (!hasActiveDataset || !documents || documents.length === 0) {
      return [];
    }
    return computePsychoSocialMatrix(documents);
  }, [documents, hasActiveDataset]);

  // Validate matrix dimensions
  const isValidMatrix = useMemo(() => {
    return validateMatrixDimensions(matrix, dimensions.length, emotions.length);
  }, [matrix]);

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    matrix.length > 0 && isValidMatrix,
    'Data tidak mencukupi untuk menghitung metrik psiko-sosial'
  );

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500 text-white';
    if (score >= 50) return 'bg-yellow-500 text-black';
    if (score >= 25) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat heatmap psiko-sosial'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Data tidak mencukupi untuk visualisasi';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Heatmap Dimensi Psiko-Sosial
          </CardTitle>
          <CardDescription>
            Analisis dimensi psikologis dan sosial berdasarkan kategori emosi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                {vizState.status === 'no-dataset' ? 'Tidak ada data aktif' : 'Data tidak mencukupi'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Heatmap Dimensi Psiko-Sosial
        </CardTitle>
        <CardDescription>
          Analisis dimensi psikologis dan sosial berdasarkan kategori emosi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: `160px repeat(${emotions.length}, 1fr)` }}>
              {/* Header row */}
              <div className="font-semibold text-sm" />
              {emotions.map((emotion) => (
                <div key={emotion} className="text-center text-sm font-semibold p-2">
                  {emotion}
                </div>
              ))}
              
              {/* Data rows */}
              {dimensions.map((dimension, rowIndex) => (
                <div key={dimension} className="contents">
                  <div className="text-sm font-medium p-2">
                    {dimension}
                  </div>
                  {emotions.map((_, colIndex) => {
                    const score = safe2DArrayAccess(matrix, rowIndex, colIndex, 0);
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`flex items-center justify-center rounded p-3 text-sm font-semibold ${getScoreColor(score)}`}
                        title={`${dimension} - ${emotions[colIndex]}: ${score.toFixed(1)}`}
                      >
                        {score.toFixed(0)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Skala Skor:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-500" />
              <span>0-24: Sangat Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-orange-500" />
              <span>25-49: Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-500" />
              <span>50-74: Sedang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-500" />
              <span>75-100: Tinggi</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
