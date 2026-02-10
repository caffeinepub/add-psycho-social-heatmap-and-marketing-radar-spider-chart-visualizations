import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { 
  getVisualizationState, 
  sanitizeChartData, 
  getEmotionDisplayLabel,
  CANONICAL_EMOTIONS,
  aggregateEmotionTotals,
  normalizeEmotionLabel
} from '../lib/visualizationState';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';

interface GenderEmotionChartProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

export function GenderEmotionChart({ documents, hasActiveDataset = true }: GenderEmotionChartProps) {
  const chartData = useMemo(() => {
    if (!hasActiveDataset || !documents || documents.length === 0) {
      return [];
    }

    // Aggregate overall emotion totals using shared helper
    const overallEmotionCounts = aggregateEmotionTotals(documents, mockEmotionAnalysis);

    // Aggregate gender-specific counts
    // For demo purposes, we'll derive gender from document ID (even=male, odd=female)
    // In production, this would come from actual gender metadata
    const genderEmotionCounts: Record<string, { male: number; female: number }> = {};
    
    documents.forEach((doc) => {
      const analysis = mockEmotionAnalysis(doc.content);
      const normalizedEmotion = normalizeEmotionLabel(analysis.primaryEmotion);
      
      if (!genderEmotionCounts[normalizedEmotion]) {
        genderEmotionCounts[normalizedEmotion] = { male: 0, female: 0 };
      }
      
      // Derive gender from document ID for demo (even=male, odd=female)
      const isMale = Number(doc.id) % 2 === 0;
      if (isMale) {
        genderEmotionCounts[normalizedEmotion].male += 1;
      } else {
        genderEmotionCounts[normalizedEmotion].female += 1;
      }
    });

    // Build chart data in canonical order, only including emotions present in dataset
    const data = CANONICAL_EMOTIONS
      .filter(emotion => overallEmotionCounts[emotion] && overallEmotionCounts[emotion] > 0)
      .map(emotion => {
        const counts = genderEmotionCounts[emotion] || { male: 0, female: 0 };
        return {
          emotion: getEmotionDisplayLabel(emotion),
          male: counts.male,
          female: counts.female,
        };
      });

    // Sanitize to ensure all values are finite numbers
    return sanitizeChartData(data, ['male', 'female']);
  }, [documents, hasActiveDataset]);

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    chartData.length > 0,
    'Data distribusi gender tidak tersedia'
  );

  const chartConfig = {
    male: {
      label: 'Pria',
      color: 'var(--chart-1)',
    },
    female: {
      label: 'Wanita',
      color: 'var(--chart-2)',
    },
  };

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat distribusi gender'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Data distribusi gender tidak tersedia';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Distribusi Emosi Berdasarkan Gender
          </CardTitle>
          <CardDescription>Perbandingan emosi antara pria dan wanita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] flex-col items-center justify-center gap-4 text-center">
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
          <Users className="h-5 w-5 text-primary" />
          Distribusi Emosi Berdasarkan Gender
        </CardTitle>
        <CardDescription>Perbandingan emosi antara pria dan wanita</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="emotion" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ fill: 'var(--muted)' }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="male" fill="var(--color-male)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="female" fill="var(--color-female)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
