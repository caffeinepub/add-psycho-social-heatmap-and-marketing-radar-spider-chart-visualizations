import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { PurchaseIntentionChart } from '../components/PurchaseIntentionChart';
import { IntentionBrandCorrelation } from '../components/IntentionBrandCorrelation';
import { IntentionTrendChart } from '../components/IntentionTrendChart';
import { IntentionDemographics } from '../components/IntentionDemographics';
import { useGetAllDocuments } from '../hooks/useQueries';
import { useMemo } from 'react';
import { computeIntentionDistribution, computeAverageIntentionScore } from '../lib/purchaseIntentionAggregation';

export function PurchaseIntentionPage() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  // Compute intention stats from documents
  const stats = useMemo(() => {
    if (documents.length === 0) {
      return {
        totalIntentions: 0,
        highPercentage: 0,
        avgScore: 0,
      };
    }

    const distribution = computeIntentionDistribution(documents);
    const total = distribution.high + distribution.medium + distribution.low;
    const highPercentage = total > 0 ? (distribution.high / total) * 100 : 0;
    const avgScore = computeAverageIntentionScore(documents);

    return {
      totalIntentions: total,
      highPercentage: highPercentage.toFixed(1),
      avgScore: avgScore.toFixed(0),
    };
  }, [documents]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Purchase Intention Dashboard</h1>
          <p className="text-muted-foreground">
            Analisis niat pembelian konsumen berdasarkan emosi dan demografi
          </p>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Purchase Intention Dashboard</h1>
        <p className="text-muted-foreground">
          Analisis niat pembelian konsumen berdasarkan emosi dan demografi
        </p>
      </div>

      {/* Stats Overview */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Intentions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntentions}</div>
            <p className="text-xs text-muted-foreground">Analisis niat pembelian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Intention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPercentage}%</div>
            <p className="text-xs text-muted-foreground">Niat pembelian tinggi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <p className="text-xs text-muted-foreground">Skor rata-rata</p>
          </CardContent>
        </Card>
      </section>

      {/* Main Visualizations */}
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <PurchaseIntentionChart key={`intention-chart-${documents.length}`} />
          <IntentionBrandCorrelation key={`brand-corr-${documents.length}`} />
        </div>

        <IntentionTrendChart key={`trend-${documents.length}`} />

        <IntentionDemographics key={`demographics-${documents.length}`} />
      </section>
    </div>
  );
}
