import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { usePurchaseIntentionData } from '../hooks/useQueries';

export function IntentionBrandCorrelation() {
  const { data: intentionData } = usePurchaseIntentionData();

  const data = intentionData?.brandCorrelation.map((item) => ({
    brand: item.brand,
    tinggi: Number(item.high),
    sedang: Number(item.medium),
    rendah: Number(item.low),
  })) || [];

  const hasData = data.length > 0;

  const chartConfig = {
    tinggi: {
      label: 'Tinggi',
      color: 'var(--chart-3)',
    },
    sedang: {
      label: 'Sedang',
      color: 'var(--chart-2)',
    },
    rendah: {
      label: 'Rendah',
      color: 'var(--chart-4)',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Korelasi Intensi per Merek
        </CardTitle>
        <CardDescription>
          Distribusi tingkat intensi pembelian berdasarkan merek motor listrik
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Tidak ada data aktif
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="brand"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="tinggi" stackId="a" fill="var(--chart-3)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sedang" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rendah" stackId="a" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
