import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import type { Document } from '../backend';
import { computeMarketingMixScores, MARKETING_MIX_FACTORS } from '../lib/marketingMixMetrics';
import { useMemo } from 'react';
import { getVisualizationState, toFiniteNumber, clamp } from '../lib/visualizationState';

interface MarketingMixRadarChartProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

export function MarketingMixRadarChart({ documents, hasActiveDataset = true }: MarketingMixRadarChartProps) {
  // Compute Marketing Mix scores (returns array of 8 numbers in order)
  const scores = useMemo(() => {
    if (!hasActiveDataset || !documents || documents.length === 0) {
      return [];
    }
    return computeMarketingMixScores(documents);
  }, [documents, hasActiveDataset]);

  // Prepare chart data with validation
  const chartData = useMemo(() => {
    if (scores.length === 0) return [];

    return MARKETING_MIX_FACTORS.map((factor, index) => ({
      factor: factor.code,
      fullName: factor.name,
      value: clamp(toFiniteNumber(scores[index], 0), 0, 100),
      fullMark: 100,
    }));
  }, [scores]);

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    chartData.length > 0 && chartData.some(d => d.value > 0),
    'Insufficient data to compute Marketing Mix metrics'
  );

  const chartConfig = {
    value: {
      label: 'Score',
      color: 'var(--chart-2)',
    },
  };

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset to view Marketing Mix analysis'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Insufficient data for visualization';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Marketing Mix (8P) Radar Chart
          </CardTitle>
          <CardDescription>
            Analysis of 8 Marketing Mix factors: Product, Price, Place, Promotion, People, Process, Physical Evidence, and Collaboration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                {vizState.status === 'no-dataset' ? 'No active data' : 'Insufficient data'}
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
          <Layers className="h-5 w-5 text-primary" />
          Marketing Mix (8P) Radar Chart
        </CardTitle>
        <CardDescription>
          Analysis of 8 Marketing Mix factors: Product, Price, Place, Promotion, People, Process, Physical Evidence, and Collaboration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <ChartContainer config={chartConfig} className="mx-auto h-[450px] w-full max-w-[550px]">
          <RadarChart data={chartData}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis 
              dataKey="factor" 
              className="text-xs font-medium"
              tick={{ fill: 'var(--foreground)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Radar
              name="Marketing Mix"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.6}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{data.factor}</p>
                      <p className="text-xs text-muted-foreground">{data.fullName}</p>
                      <p className="text-sm font-medium text-primary">
                        Score: {data.value.toFixed(1)}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ChartContainer>

        {/* Legend with full factor names */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {MARKETING_MIX_FACTORS.map((factor) => (
            <div key={factor.code} className="flex items-start gap-2 rounded-md border p-2">
              <div className="mt-0.5 h-3 w-3 shrink-0 rounded-sm bg-chart-2" />
              <div>
                <p className="font-semibold">{factor.code}</p>
                <p className="text-muted-foreground">{factor.name}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
