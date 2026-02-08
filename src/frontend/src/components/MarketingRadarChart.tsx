import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import type { Document } from '../backend';
import { computeMarketingMetrics } from '../lib/marketingMetrics';
import { useMemo } from 'react';
import { getVisualizationState, toFiniteNumber, clamp } from '../lib/visualizationState';

interface MarketingRadarChartProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

export function MarketingRadarChart({ documents, hasActiveDataset = true }: MarketingRadarChartProps) {
  // Compute marketing metrics (returns array of {metric, score})
  const metricsArray = useMemo(() => {
    if (!hasActiveDataset || !documents || documents.length === 0) {
      return [];
    }
    return computeMarketingMetrics(documents);
  }, [documents, hasActiveDataset]);

  // Prepare chart data with validation
  const chartData = useMemo(() => {
    if (metricsArray.length === 0) return [];

    return metricsArray.map(item => ({
      metric: item.metric,
      value: clamp(toFiniteNumber(item.score, 0), 0, 100),
      fullMark: 100,
    }));
  }, [metricsArray]);

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    chartData.length > 0 && chartData.some(d => d.value > 0),
    'Data tidak mencukupi untuk menghitung metrik marketing'
  );

  const chartConfig = {
    value: {
      label: 'Skor',
      color: 'var(--chart-1)',
    },
  };

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat metrik marketing'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Data tidak mencukupi untuk visualisasi';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Radar Chart Efektivitas Marketing
          </CardTitle>
          <CardDescription>
            Analisis metrik marketing funnel dari awareness hingga advocacy
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
          <Target className="h-5 w-5 text-primary" />
          Radar Chart Efektivitas Marketing
        </CardTitle>
        <CardDescription>
          Analisis metrik marketing funnel dari awareness hingga advocacy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <ChartContainer config={chartConfig} className="mx-auto h-[400px] w-full max-w-[500px]">
          <RadarChart data={chartData}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="metric" 
              className="text-xs"
              tick={{ fill: 'var(--foreground)' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Radar
              name="Marketing Metrics"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.6}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Skor']}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>

        {/* Metrics Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          {chartData.map((item) => (
            <Card key={item.metric} className="border-muted">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.metric}</p>
                    <p className="text-2xl font-bold">{item.value.toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-semibold mb-2">Interpretasi Metrik:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li><strong>Awareness:</strong> Tingkat kesadaran terhadap produk/merek</li>
            <li><strong>Consideration:</strong> Pertimbangan untuk membeli</li>
            <li><strong>Preference:</strong> Preferensi terhadap merek tertentu</li>
            <li><strong>Intent:</strong> Niat pembelian yang kuat</li>
            <li><strong>Advocacy:</strong> Kesediaan merekomendasikan kepada orang lain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
