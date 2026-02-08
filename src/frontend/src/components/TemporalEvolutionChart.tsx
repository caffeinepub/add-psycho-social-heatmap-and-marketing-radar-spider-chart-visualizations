import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';

interface TemporalEvolutionChartProps {
  documents: Document[];
}

export function TemporalEvolutionChart({ documents }: TemporalEvolutionChartProps) {
  // Group documents by time periods (simplified for demo)
  const timeGroups: Record<string, Record<string, number>> = {};
  
  documents.forEach((doc, index) => {
    const period = `T${Math.floor(index / 5) + 1}`;
    if (!timeGroups[period]) {
      timeGroups[period] = {};
    }
    const analysis = mockEmotionAnalysis(doc.content);
    timeGroups[period][analysis.primaryEmotion] = 
      (timeGroups[period][analysis.primaryEmotion] || 0) + 1;
  });

  const data = Object.entries(timeGroups).map(([period, emotions]) => ({
    period,
    minat: emotions['minat'] || 0,
    kepercayaan: emotions['kepercayaan'] || 0,
    kepuasan: emotions['kepuasan'] || 0,
    skeptisisme: emotions['skeptisisme'] || 0,
    ketakutan: emotions['ketakutan'] || 0,
  }));

  const chartConfig = {
    minat: {
      label: 'Minat',
      color: 'var(--chart-1)',
    },
    kepercayaan: {
      label: 'Kepercayaan',
      color: 'var(--chart-2)',
    },
    kepuasan: {
      label: 'Kepuasan',
      color: 'var(--chart-3)',
    },
    skeptisisme: {
      label: 'Skeptisisme',
      color: 'var(--chart-4)',
    },
    ketakutan: {
      label: 'Ketakutan',
      color: 'var(--chart-5)',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolusi Temporal
        </CardTitle>
        <CardDescription>Perubahan emosi dari waktu ke waktu</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Tidak ada data untuk ditampilkan
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
              <Line type="monotone" dataKey="minat" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="kepercayaan" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="kepuasan" stroke="var(--chart-3)" strokeWidth={2} />
              <Line type="monotone" dataKey="skeptisisme" stroke="var(--chart-4)" strokeWidth={2} />
              <Line type="monotone" dataKey="ketakutan" stroke="var(--chart-5)" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
