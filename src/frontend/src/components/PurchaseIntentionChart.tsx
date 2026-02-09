import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { useGetAllDocuments } from '../hooks/useQueries';
import { useMemo } from 'react';
import { computeIntentionDistribution } from '../lib/purchaseIntentionAggregation';

export function PurchaseIntentionChart() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  const data = useMemo(() => {
    if (documents.length === 0) return [];

    const distribution = computeIntentionDistribution(documents);

    return [
      {
        level: 'Tinggi',
        value: distribution.high,
        fill: 'var(--chart-3)',
      },
      {
        level: 'Sedang',
        value: distribution.medium,
        fill: 'var(--chart-2)',
      },
      {
        level: 'Rendah',
        value: distribution.low,
        fill: 'var(--chart-4)',
      },
    ];
  }, [documents]);

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
