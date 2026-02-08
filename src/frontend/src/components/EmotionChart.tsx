import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export function EmotionChart() {
  const data = [
    { emotion: 'Minat', count: 45, fill: 'var(--chart-1)' },
    { emotion: 'Kepercayaan', count: 38, fill: 'var(--chart-2)' },
    { emotion: 'Kepuasan', count: 32, fill: 'var(--chart-3)' },
    { emotion: 'Skeptisisme', count: 18, fill: 'var(--chart-4)' },
    { emotion: 'Ketakutan', count: 12, fill: 'var(--chart-5)' },
  ];

  const chartConfig = {
    count: {
      label: 'Jumlah',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Distribusi Emosi
        </CardTitle>
        <CardDescription>Frekuensi deteksi emosi dari semua analisis</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="emotion"
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
            <Bar dataKey="count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
