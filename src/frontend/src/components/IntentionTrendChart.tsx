import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useGetAllDocuments } from '../hooks/useQueries';
import { useMemo } from 'react';
import { computeIntentionTrends } from '../lib/purchaseIntentionAggregation';

export function IntentionTrendChart() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  const { data, levels } = useMemo(() => {
    if (documents.length === 0) return { data: [], levels: [] };

    const trends = computeIntentionTrends(documents);

    // Group by level
    const trendsByLevel: Record<string, Array<{ id: number; trend: number }>> = {};
    trends.forEach((trend) => {
      const level = trend.intentionLevel;
      if (!trendsByLevel[level]) {
        trendsByLevel[level] = [];
      }
      trendsByLevel[level].push({
        id: trend.id,
        trend: trend.trend,
      });
    });

    // Create time series data
    const chartData = Array.from({ length: 6 }, (_, i) => {
      const point: Record<string, number | string> = { period: `T${i + 1}` };
      Object.entries(trendsByLevel).forEach(([level, levelTrends]) => {
        const trendValue = levelTrends[i % levelTrends.length]?.trend || 0;
        point[level] = trendValue;
      });
      return point;
    });

    return {
      data: chartData,
      levels: Object.keys(trendsByLevel),
    };
  }, [documents]);

  const hasData = data.length > 0 && levels.length > 0;

  const chartConfig = {
    high: {
      label: 'Tinggi',
      color: 'var(--chart-3)',
    },
    medium: {
      label: 'Sedang',
      color: 'var(--chart-2)',
    },
    low: {
      label: 'Rendah',
      color: 'var(--chart-4)',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tren Historis Intensi Pembelian
        </CardTitle>
        <CardDescription>
          Evolusi skor intensi pembelian dari waktu ke waktu
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No active dataset
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {levels.map((level, index) => (
                <Line
                  key={level}
                  type="monotone"
                  dataKey={level}
                  stroke={`var(--chart-${(index % 5) + 1})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
