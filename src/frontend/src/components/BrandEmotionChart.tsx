import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';
import { useMemo } from 'react';
import { getVisualizationState, sanitizeChartData, normalizeEmotionLabel, getEmotionDisplayLabel } from '../lib/visualizationState';

interface BrandEmotionChartProps {
  documents: Document[];
}

export function BrandEmotionChart({ documents }: BrandEmotionChartProps) {
  // Aggregate emotions by brand
  const chartData = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [];
    }

    const brandEmotions: Record<string, Record<string, number>> = {};
    
    documents.forEach((doc) => {
      const analysis = mockEmotionAnalysis(doc.content);
      if (analysis.brand) {
        if (!brandEmotions[analysis.brand]) {
          brandEmotions[analysis.brand] = {
            interest: 0,
            trust: 0,
            satisfaction: 0,
            skepticism: 0,
            fear: 0,
          };
        }
        // Normalize emotion to English
        const normalizedEmotion = normalizeEmotionLabel(analysis.primaryEmotion);
        brandEmotions[analysis.brand][normalizedEmotion] = 
          (brandEmotions[analysis.brand][normalizedEmotion] || 0) + 1;
      }
    });

    const data = Object.entries(brandEmotions).map(([brand, emotions]) => ({
      brand,
      interest: emotions.interest || 0,
      trust: emotions.trust || 0,
      satisfaction: emotions.satisfaction || 0,
      skepticism: emotions.skepticism || 0,
      fear: emotions.fear || 0,
    }));

    // Sanitize to ensure all values are finite numbers
    return sanitizeChartData(data, ['interest', 'trust', 'satisfaction', 'skepticism', 'fear']);
  }, [documents]);

  // Determine visualization state
  const vizState = getVisualizationState(
    documents.length > 0,
    chartData.length > 0,
    'Tidak ada merek terdeteksi dalam dokumen'
  );

  const chartConfig = {
    interest: {
      label: 'Minat',
      color: 'var(--chart-1)',
    },
    trust: {
      label: 'Kepercayaan',
      color: 'var(--chart-2)',
    },
    satisfaction: {
      label: 'Kepuasan',
      color: 'var(--chart-3)',
    },
    skepticism: {
      label: 'Skeptisisme',
      color: 'var(--chart-4)',
    },
    fear: {
      label: 'Ketakutan',
      color: 'var(--chart-5)',
    },
  };

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat distribusi emosi per merek'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Tidak ada merek untuk ditampilkan';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Distribusi Emosi per Merek
          </CardTitle>
          <CardDescription>
            Analisis emosi berdasarkan merek sepeda motor listrik
          </CardDescription>
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
          <Package className="h-5 w-5 text-primary" />
          Distribusi Emosi per Merek
        </CardTitle>
        <CardDescription>
          Analisis emosi berdasarkan merek sepeda motor listrik
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="brand"
              angle={-45}
              textAnchor="end"
              height={80}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="interest" stackId="a" fill="var(--color-interest)" />
            <Bar dataKey="trust" stackId="a" fill="var(--color-trust)" />
            <Bar dataKey="satisfaction" stackId="a" fill="var(--color-satisfaction)" />
            <Bar dataKey="skepticism" stackId="a" fill="var(--color-skepticism)" />
            <Bar dataKey="fear" stackId="a" fill="var(--color-fear)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
