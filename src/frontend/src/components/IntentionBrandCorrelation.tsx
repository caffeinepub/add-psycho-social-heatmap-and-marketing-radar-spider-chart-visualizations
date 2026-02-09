import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useGetAllDocuments } from '../hooks/useQueries';
import { useMemo } from 'react';
import { computeIntentionByBrand } from '../lib/purchaseIntentionAggregation';

export function IntentionBrandCorrelation() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  const data = useMemo(() => {
    if (documents.length === 0) return [];

    const brandData = computeIntentionByBrand(documents);

    return brandData.map((item) => ({
      brand: item.brand,
      tinggi: item.high,
      sedang: item.medium,
      rendah: item.low,
    }));
  }, [documents]);

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
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No active dataset or insufficient brand data
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
