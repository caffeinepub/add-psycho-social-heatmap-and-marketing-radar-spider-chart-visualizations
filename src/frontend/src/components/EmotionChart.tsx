import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';
import { useMemo } from 'react';
import { getVisualizationState, sanitizeChartData, normalizeEmotionLabel, getEmotionDisplayLabel } from '../lib/visualizationState';

interface EmotionChartProps {
  documents: Document[];
  hasActiveDataset?: boolean;
}

type EmotionData = {
  emotion: string;
  displayLabel: string;
  count: number;
  fill: string;
};

export function EmotionChart({ documents, hasActiveDataset = true }: EmotionChartProps) {
  // Calculate emotion distribution from documents
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

  // Determine visualization state
  const vizState = getVisualizationState(
    hasActiveDataset && documents.length > 0,
    emotionData.length > 0,
    'No emotions detected in documents'
  );

  const chartConfig = {
    count: {
      label: 'Count',
    },
  };

  // Show empty state if no dataset or insufficient data
  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset' 
      ? 'No analyzed data yet. Upload text or a file to begin.'
      : (vizState.status === 'insufficient-data' && vizState.message) 
        ? vizState.message 
        : 'Insufficient data for visualization';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Emotion Distribution
          </CardTitle>
          <CardDescription>Frequency of emotion detection across all analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                {vizState.status === 'no-dataset' ? 'No Active Data' : 'Insufficient Data'}
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

  // Show visualization with current data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Emotion Distribution
        </CardTitle>
        <CardDescription>Frequency of emotion detection across all analyses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={emotionData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayLabel"
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
