import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useGenderDistribution } from '../hooks/useQueries';
import { useMemo } from 'react';
import { getVisualizationState, sanitizeChartData, getEmotionDisplayLabel } from '../lib/visualizationState';

export function GenderEmotionChart() {
  const { data: genderData, isLoading } = useGenderDistribution();

  const chartData = useMemo(() => {
    if (!genderData || !genderData.emotionDistribution) {
      return [];
    }

    const data = genderData.emotionDistribution.map((item) => ({
      emotion: getEmotionDisplayLabel(item.category),
      male: item.maleCount || 0,
      female: item.femaleCount || 0,
    }));

    // Sanitize to ensure all values are finite numbers
    return sanitizeChartData(data, ['male', 'female']);
  }, [genderData]);

  // Determine visualization state
  const vizState = getVisualizationState(
    !!genderData,
    chartData.length > 0,
    'Data distribusi gender tidak tersedia'
  );

  const chartConfig = {
    male: {
      label: 'Pria',
      color: 'var(--chart-1)',
    },
    female: {
      label: 'Wanita',
      color: 'var(--chart-2)',
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Distribusi Emosi Berdasarkan Gender
          </CardTitle>
          <CardDescription>Perbandingan emosi antara pria dan wanita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat distribusi gender'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Data distribusi gender tidak tersedia';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Distribusi Emosi Berdasarkan Gender
          </CardTitle>
          <CardDescription>Perbandingan emosi antara pria dan wanita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                {vizState.status === 'no-dataset' ? 'Tidak ada data aktif' : 'Data tidak mencukupi'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {message}
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
          <Users className="h-5 w-5 text-primary" />
          Distribusi Emosi Berdasarkan Gender
        </CardTitle>
        <CardDescription>Perbandingan emosi antara pria dan wanita</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="emotion" className="text-xs" />
            <YAxis className="text-xs" />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ fill: 'var(--muted)' }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="male" fill="var(--color-male)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="female" fill="var(--color-female)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
