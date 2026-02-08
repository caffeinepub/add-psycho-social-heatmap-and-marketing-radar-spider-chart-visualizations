import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Document } from '../backend';
import { computePsychoSocialMatrix } from '../lib/psychoSocialMetrics';
import { useMemo } from 'react';
import { getVisualizationState, safe2DArrayAccess, validateMatrixDimensions } from '../lib/visualizationState';

interface PsychoSocialHeatmapProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

// UTAUT2 constructs with definitions
const dimensions = [
  {
    code: 'PE',
    label: 'Performance Expectancy',
    labelId: 'Harapan Kinerja',
    definition: 'Sejauh mana seseorang percaya bahwa menggunakan sistem/teknologi akan membantu mereka meningkatkan kinerja atau produktivitas.',
    definitionEn: 'The degree to which a person believes that using the system/technology will help them improve their performance or productivity.',
  },
  {
    code: 'EE',
    label: 'Effort Expectancy',
    labelId: 'Harapan Usaha',
    definition: 'Tingkat kemudahan yang dikaitkan dengan penggunaan sistem atau teknologi.',
    definitionEn: 'The level of ease associated with using the system or technology.',
  },
  {
    code: 'SI',
    label: 'Social Influence',
    labelId: 'Pengaruh Sosial',
    definition: 'Sejauh mana seseorang menganggap bahwa orang lain yang penting (keluarga, teman, kolega) meyakini mereka harus menggunakan teknologi tersebut.',
    definitionEn: 'The degree to which a person believes that important others (family, friends, colleagues) think they should use the technology.',
  },
  {
    code: 'HM',
    label: 'Hedonic Motivation',
    labelId: 'Motivasi Hedonis',
    definition: 'Kesenangan atau kegembiraan yang diperoleh dari penggunaan teknologi.',
    definitionEn: 'The pleasure or enjoyment derived from using the technology.',
  },
  {
    code: 'FC',
    label: 'Facilitating Conditions',
    labelId: 'Kondisi Pendukung',
    definition: 'Sejauh mana seseorang percaya bahwa infrastruktur teknis dan organisasional tersedia untuk mendukung penggunaan sistem.',
    definitionEn: 'The degree to which a person believes that technical and organizational infrastructure is available to support system use.',
  },
  {
    code: 'PV',
    label: 'Price Value',
    labelId: 'Nilai Harga',
    definition: 'Konsumen menilai manfaat dari aplikasi/teknologi dibandingkan dengan biaya (uang) yang harus dikeluarkan. Nilai harga positif jika manfaatnya lebih tinggi daripada biayanya.',
    definitionEn: 'Consumers assess the benefits of the application/technology compared to the cost (money) that must be spent. Price value is positive if the benefits are higher than the costs.',
  },
  {
    code: 'H',
    label: 'Habit',
    labelId: 'Kebiasaan',
    definition: 'Tingkat di mana orang cenderung melakukan perilaku secara otomatis karena kebiasaan.',
    definitionEn: 'The degree to which people tend to perform behaviors automatically due to habit.',
  },
];

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
            Heatmap Dimensi Psiko-Sosial (UTAUT2)
          </CardTitle>
          <CardDescription>
            Analisis dimensi psikologis dan sosial berdasarkan model UTAUT2
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
          Heatmap Dimensi Psiko-Sosial (UTAUT2)
        </CardTitle>
        <CardDescription>
          Analisis dimensi psikologis dan sosial berdasarkan model UTAUT2
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <TooltipProvider>
              <div className="grid gap-1" style={{ gridTemplateColumns: `200px repeat(${emotions.length}, 1fr)` }}>
                {/* Header row */}
                <div className="font-semibold text-sm" />
                {emotions.map((emotion) => (
                  <div key={emotion} className="text-center text-sm font-semibold p-2">
                    {emotion}
                  </div>
                ))}
                
                {/* Data rows */}
                {dimensions.map((dimension, rowIndex) => (
                  <div key={dimension.code} className="contents">
                    <div className="flex items-center gap-1 text-sm font-medium p-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <span className="font-bold">{dimension.code}</span>
                            <span className="text-muted-foreground">({dimension.labelId})</span>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-semibold mb-1">{dimension.label}</p>
                          <p className="text-xs">{dimension.definition}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {emotions.map((_, colIndex) => {
                      const score = safe2DArrayAccess(matrix, rowIndex, colIndex, 0);
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`flex items-center justify-center rounded p-3 text-sm font-semibold ${getScoreColor(score)}`}
                          title={`${dimension.code} (${dimension.labelId}) - ${emotions[colIndex]}: ${score.toFixed(1)}`}
                        >
                          {score.toFixed(0)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
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

        {/* UTAUT2 Reference */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h4 className="text-sm font-semibold mb-2">Referensi UTAUT2:</h4>
          <p className="text-xs text-muted-foreground">
            Model UTAUT2 (Unified Theory of Acceptance and Use of Technology 2) mengidentifikasi 7 faktor utama yang mempengaruhi penerimaan dan penggunaan teknologi oleh konsumen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
