import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';

interface ModelMetric {
  name: string;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

interface ModelPerformanceChartProps {
  metrics: ModelMetric[];
  hasActiveDataset?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
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

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-semibold text-card-foreground">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {entry.dataKey}
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

export function ModelPerformanceChart({ metrics, hasActiveDataset = true }: ModelPerformanceChartProps) {
  // Convert decimal metrics (0-1) to percentages (0-100) with validation
  const data = useMemo(() => {
    if (!hasActiveDataset) return [];
    return metrics.map((metric) => ({
      model: metric.name,
      Precision: toPercentage(metric.precision),
      Recall: toPercentage(metric.recall),
      'F1-Score': toPercentage(metric.f1Score),
    }));
  }, [metrics, hasActiveDataset]);

  const chartConfig = {
    Precision: {
      label: 'Precision',
      color: 'oklch(var(--chart-1))',
    },
    Recall: {
      label: 'Recall',
      color: 'oklch(var(--chart-2))',
    },
    'F1-Score': {
      label: 'F1-Score',
      color: 'oklch(var(--chart-3))',
    },
  };

  // Show empty state if no active dataset
  if (!hasActiveDataset || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Perbandingan Performa Model
          </CardTitle>
          <CardDescription>Metrik precision, recall, dan F1-score per model (skala 0-100%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
              <p className="text-sm text-muted-foreground/70">
                Upload dataset untuk melihat performa model
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
          <BarChart3 className="h-5 w-5 text-primary" />
          Perbandingan Performa Model
        </CardTitle>
        <CardDescription>Metrik precision, recall, dan F1-score per model (skala 0-100%)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="model"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              label={{ 
                value: 'Persentase (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
              }}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Precision" fill="oklch(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Recall" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="F1-Score" fill="oklch(var(--chart-3))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
