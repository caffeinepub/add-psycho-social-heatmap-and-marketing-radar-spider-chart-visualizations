import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { usePurchaseIntentionData } from '../hooks/useQueries';

export function IntentionDemographics() {
  const { data: intentionData } = usePurchaseIntentionData();

  // Mock demographic data based on intention data
  const genderData = intentionData
    ? [
        {
          category: 'Pria',
          tinggi: Math.floor(Number(intentionData.distribution.high) * 0.6),
          sedang: Math.floor(Number(intentionData.distribution.medium) * 0.55),
          rendah: Math.floor(Number(intentionData.distribution.low) * 0.5),
        },
        {
          category: 'Wanita',
          tinggi: Math.floor(Number(intentionData.distribution.high) * 0.4),
          sedang: Math.floor(Number(intentionData.distribution.medium) * 0.45),
          rendah: Math.floor(Number(intentionData.distribution.low) * 0.5),
        },
      ]
    : [];

  const locationData = intentionData
    ? [
        {
          location: 'Jawa',
          tinggi: Math.floor(Number(intentionData.distribution.high) * 0.5),
          sedang: Math.floor(Number(intentionData.distribution.medium) * 0.4),
          rendah: Math.floor(Number(intentionData.distribution.low) * 0.3),
        },
        {
          location: 'Sumatera',
          tinggi: Math.floor(Number(intentionData.distribution.high) * 0.3),
          sedang: Math.floor(Number(intentionData.distribution.medium) * 0.35),
          rendah: Math.floor(Number(intentionData.distribution.low) * 0.4),
        },
        {
          location: 'Kalimantan',
          tinggi: Math.floor(Number(intentionData.distribution.high) * 0.2),
          sedang: Math.floor(Number(intentionData.distribution.medium) * 0.25),
          rendah: Math.floor(Number(intentionData.distribution.low) * 0.3),
        },
      ]
    : [];

  const hasData = genderData.length > 0 && locationData.length > 0;

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
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Segmentasi Gender
          </CardTitle>
          <CardDescription>Distribusi intensi pembelian berdasarkan gender</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Tidak ada data aktif
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={genderData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="category"
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
                <Bar dataKey="tinggi" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sedang" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rendah" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Segmentasi Geografis
          </CardTitle>
          <CardDescription>Distribusi intensi pembelian berdasarkan lokasi</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Tidak ada data aktif
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={locationData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="location"
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
                <Bar dataKey="tinggi" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sedang" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rendah" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
