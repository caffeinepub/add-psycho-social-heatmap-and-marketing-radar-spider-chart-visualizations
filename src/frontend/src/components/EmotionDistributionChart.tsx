import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart as RechartsPie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';
import { useMemo } from 'react';
import { getVisualizationState, sanitizeChartData, normalizeEmotionLabel, getEmotionDisplayLabel } from '../lib/visualizationState';

interface EmotionDistributionChartProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

type EmotionData = {
  emotion: string;
  displayLabel: string;
  count: number;
  fill: string;
};

export function EmotionDistributionChart({ documents, hasActiveDataset = true }: EmotionDistributionChartProps) {
  // Calculate emotion distribution
  const emotionData = useMemo(() => {
    if (!hasActiveDataset || !documents || documents.length === 0) {
      return [];
    }

    const emotionCounts: Record<string, number> = {};
    
    documents.forEach((doc) => {
      const analysis = mockEmotionAnalysis(doc.content);
      // Normalize to English for consistency
      const normalizedEmotion = normalizeEmotionLabel(analysis.primaryEmotion);
      emotionCounts[normalizedEmotion] = (emotionCounts[normalizedEmotion] || 0) + 1;
    });

    const data = Object.entries(emotionCounts).map(([emotion, count], index) => ({
      emotion,
      displayLabel: getEmotionDisplayLabel(emotion),
      count,
      fill: `var(--chart-${(index % 5) + 1})`,
    }));

    // Sanitize to ensure all counts are finite numbers
    return sanitizeChartData(data, ['count']);
  }, [documents, hasActiveDataset]);

  // Calculate total for percentage
  const total = useMemo(() => {
    return emotionData.reduce((sum, item) => sum + item.count, 0);
  }, [emotionData]);

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    emotionData.length > 0 && total > 0,
    'Tidak ada emosi terdeteksi dalam dokumen'
  );

  const chartConfig = {
    count: {
      label: 'Jumlah',
    },
  };

  // Show empty state if no dataset or insufficient data
  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset' 
      ? 'Upload dataset untuk melihat distribusi emosi'
      : (vizState.status === 'insufficient-data' && vizState.message) 
        ? vizState.message 
        : 'Data tidak mencukupi untuk visualisasi';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Distribusi Emosi
          </CardTitle>
          <CardDescription>Proporsi emosi dari dokumen yang difilter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
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
          
          {/* Empty frequency table */}
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-semibold">Tabel Frekuensi Emosi</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Emosi</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show visualization with current data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Distribusi Emosi
        </CardTitle>
        <CardDescription>Proporsi emosi dari dokumen yang difilter</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <RechartsPie>
            <Pie
              data={emotionData}
              dataKey="count"
              nameKey="displayLabel"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.displayLabel}: ${((entry.count / total) * 100).toFixed(1)}%`}
            >
              {emotionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </RechartsPie>
        </ChartContainer>

        {/* Frequency table */}
        <div>
          <h4 className="mb-3 text-sm font-semibold">Tabel Frekuensi Emosi</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emosi</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Persentase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emotionData.map((item) => (
                <TableRow key={item.emotion}>
                  <TableCell className="font-medium">{item.displayLabel}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">
                    {((item.count / total) * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{total}</TableCell>
                <TableCell className="text-right">100.00%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
