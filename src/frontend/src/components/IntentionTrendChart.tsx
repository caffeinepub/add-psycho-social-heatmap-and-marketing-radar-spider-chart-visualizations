import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { usePurchaseIntentionData } from '../hooks/useQueries';

export function IntentionTrendChart() {
  const { data: intentionData } = usePurchaseIntentionData();

  // Group trends by emotion/intention level
  const trendsByLevel: Record<string, Array<{ id: number; trend: number }>> = {};
  
  intentionData?.trends.forEach((trend) => {
    const level = trend.intentionLevel;
    if (!trendsByLevel[level]) {
      trendsByLevel[level] = [];
    }
    trendsByLevel[level].push({
      id: Number(trend.id),
      trend: Number(trend.trend),
    });
  });

  // Create time series data
  const data = Object.keys(trendsByLevel).length > 0
    ? Array.from({ length: 6 }, (_, i) => {
        const point: Record<string, number | string> = { period: `T${i + 1}` };
        Object.entries(trendsByLevel).forEach(([level, trends]) => {
          const trendValue = trends[i % trends.length]?.trend || 0;
          point[level] = trendValue;
        });
        return point;
      })
    : [];

  const hasData = data.length > 0;

  const chartConfig = {
    trust: {
      label: 'Kepercayaan',
      color: 'var(--chart-2)',
    },
    satisfaction: {
      label: 'Kepuasan',
      color: 'var(--chart-3)',
    },
    interest: {
      label: 'Minat',
      color: 'var(--chart-1)',
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
          Evolusi skor intensi pembelian dari waktu ke waktu berdasarkan emosi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Tidak ada data aktif
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
              {Object.keys(trendsByLevel).map((level, index) => (
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
