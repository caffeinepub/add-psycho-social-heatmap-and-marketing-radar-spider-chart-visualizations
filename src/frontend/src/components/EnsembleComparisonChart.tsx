import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface EnsembleMetric {
  name: string;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

interface EnsembleComparisonChartProps {
  metrics: EnsembleMetric[];
  hasActiveDataset?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload: {
      metric: string;
      JC: number;
      JA: number;
      JD: number;
    };
  }>;
}

/**
 * Validates and clamps percentage values to ensure they're within 0-100% range
 */
function validatePercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Converts decimal metric (0-1) to percentage (0-100) with validation
 */
function toPercentage(value: number): number {
  return validatePercentage(value * 100);
}

/**
 * Formats percentage value with 2 decimal places for consistency
 */
function formatPercentage(value: number): string {
  return validatePercentage(value).toFixed(2);
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const metric = payload[0].payload.metric;
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-semibold text-card-foreground">{metric}</p>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: entry.dataKey === 'JC' 
                      ? 'oklch(var(--chart-1))' 
                      : entry.dataKey === 'JA' 
                      ? 'oklch(var(--chart-2))' 
                      : 'oklch(var(--chart-3))',
                  }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.dataKey === 'JC' ? 'Jury Classic' : entry.dataKey === 'JA' ? 'Jury Adaptive' : 'Jury Dynamic'}
                </span>
              </div>
              <span className="text-sm font-bold text-card-foreground">
                {formatPercentage(entry.value)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function EnsembleComparisonChart({ metrics, hasActiveDataset = true }: EnsembleComparisonChartProps) {
  // Ensure metrics array has exactly 3 elements (JC, JA, JD) and convert to percentages with validation
  const data = useMemo(() => {
    if (!hasActiveDataset || metrics.length === 0) return [];
    
    // Validate we have the expected 3 ensemble methods
    if (metrics.length !== 3) {
      console.warn('Expected 3 ensemble metrics (JC, JA, JD), got:', metrics.length);
    }

    return [
      {
        metric: 'Precision',
        JC: toPercentage(metrics[0]?.precision || 0),
        JA: toPercentage(metrics[1]?.precision || 0),
        JD: toPercentage(metrics[2]?.precision || 0),
      },
      {
        metric: 'Recall',
        JC: toPercentage(metrics[0]?.recall || 0),
        JA: toPercentage(metrics[1]?.recall || 0),
        JD: toPercentage(metrics[2]?.recall || 0),
      },
      {
        metric: 'F1-Score',
        JC: toPercentage(metrics[0]?.f1Score || 0),
        JA: toPercentage(metrics[1]?.f1Score || 0),
        JD: toPercentage(metrics[2]?.f1Score || 0),
      },
      {
        metric: 'Accuracy',
        JC: toPercentage(metrics[0]?.accuracy || 0),
        JA: toPercentage(metrics[1]?.accuracy || 0),
        JD: toPercentage(metrics[2]?.accuracy || 0),
      },
    ];
  }, [metrics, hasActiveDataset]);

  const chartConfig = {
    JC: {
      label: 'Jury Classic',
      color: 'oklch(var(--chart-1))',
    },
    JA: {
      label: 'Jury Adaptive',
      color: 'oklch(var(--chart-2))',
    },
    JD: {
      label: 'Jury Dynamic',
      color: 'oklch(var(--chart-3))',
    },
  };

  // Show empty state if no active dataset
  if (!hasActiveDataset || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Perbandingan Ensemble
          </CardTitle>
          <CardDescription>Radar chart performa algoritma CJT dengan tooltip akurat dan legend yang selaras (skala 0-100%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
              <p className="text-sm text-muted-foreground/70">
                Upload dataset untuk melihat perbandingan ensemble
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
          <TrendingUp className="h-5 w-5 text-primary" />
          Perbandingan Ensemble
        </CardTitle>
        <CardDescription>Radar chart performa algoritma CJT dengan tooltip akurat dan legend yang selaras (skala 0-100%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <defs>
                <linearGradient id="gradientJC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(var(--chart-1))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradientJA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(var(--chart-2))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradientJD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(var(--chart-3))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(var(--chart-3))" stopOpacity={0.1} />
                </linearGradient>
                <filter id="shadowJC">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="oklch(var(--chart-1))" floodOpacity="0.4" />
                </filter>
                <filter id="shadowJA">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="oklch(var(--chart-2))" floodOpacity="0.4" />
                </filter>
                <filter id="shadowJD">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="oklch(var(--chart-3))" floodOpacity="0.4" />
                </filter>
              </defs>
              <PolarGrid 
                className="stroke-muted" 
                strokeWidth={1.5}
                strokeOpacity={0.3}
              />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ 
                  fill: 'oklch(var(--foreground))',
                  fontSize: 13,
                  fontWeight: 600,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ 
                  fill: 'oklch(var(--muted-foreground))',
                  fontSize: 11,
                }} 
                tickCount={6}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ChartLegend 
                content={<ChartLegendContent />}
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
              <Radar
                name="Jury Classic"
                dataKey="JC"
                stroke="oklch(var(--chart-1))"
                fill="url(#gradientJC)"
                strokeWidth={3}
                filter="url(#shadowJC)"
                dot={{ 
                  r: 5, 
                  fill: 'oklch(var(--chart-1))',
                  strokeWidth: 2,
                  stroke: 'oklch(var(--background))',
                }}
                activeDot={{ 
                  r: 7,
                  fill: 'oklch(var(--chart-1))',
                  strokeWidth: 3,
                  stroke: 'oklch(var(--background))',
                }}
                animationDuration={800}
                animationBegin={0}
              />
              <Radar
                name="Jury Adaptive"
                dataKey="JA"
                stroke="oklch(var(--chart-2))"
                fill="url(#gradientJA)"
                strokeWidth={3}
                filter="url(#shadowJA)"
                dot={{ 
                  r: 5, 
                  fill: 'oklch(var(--chart-2))',
                  strokeWidth: 2,
                  stroke: 'oklch(var(--background))',
                }}
                activeDot={{ 
                  r: 7,
                  fill: 'oklch(var(--chart-2))',
                  strokeWidth: 3,
                  stroke: 'oklch(var(--background))',
                }}
                animationDuration={800}
                animationBegin={200}
              />
              <Radar
                name="Jury Dynamic"
                dataKey="JD"
                stroke="oklch(var(--chart-3))"
                fill="url(#gradientJD)"
                strokeWidth={3}
                filter="url(#shadowJD)"
                dot={{ 
                  r: 5, 
                  fill: 'oklch(var(--chart-3))',
                  strokeWidth: 2,
                  stroke: 'oklch(var(--background))',
                }}
                activeDot={{ 
                  r: 7,
                  fill: 'oklch(var(--chart-3))',
                  strokeWidth: 3,
                  stroke: 'oklch(var(--background))',
                }}
                animationDuration={800}
                animationBegin={400}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
