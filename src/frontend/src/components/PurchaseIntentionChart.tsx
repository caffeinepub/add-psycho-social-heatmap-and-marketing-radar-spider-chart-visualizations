import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { usePurchaseIntentionData } from '../hooks/useQueries';

export function PurchaseIntentionChart() {
  const { data: intentionData } = usePurchaseIntentionData();

  const data = intentionData
    ? [
        {
          level: 'Tinggi',
          value: Number(intentionData.distribution.high),
          fill: 'var(--chart-3)',
        },
        {
          level: 'Sedang',
          value: Number(intentionData.distribution.medium),
          fill: 'var(--chart-2)',
        },
        {
          level: 'Rendah',
          value: Number(intentionData.distribution.low),
          fill: 'var(--chart-4)',
        },
      ]
    : [];

  const hasData = data.some((item) => item.value > 0);

  const chartConfig = {
    value: {
      label: 'Jumlah',
    },
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
          <ShoppingCart className="h-5 w-5 text-primary" />
          Distribusi Intensi Pembelian
        </CardTitle>
        <CardDescription>Klasifikasi tingkat intensi pembelian konsumen</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Tidak ada data aktif
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="level"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.level}: ${entry.value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
