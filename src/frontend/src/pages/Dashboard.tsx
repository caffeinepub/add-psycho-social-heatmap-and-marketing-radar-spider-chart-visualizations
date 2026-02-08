import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useUploadDocument, useGetAllDocuments } from '../hooks/useQueries';
import { toast } from 'sonner';
import { EmotionChart } from '../components/EmotionChart';
import { RecentAnalysis } from '../components/RecentAnalysis';
import { BrandEmotionChart } from '../components/BrandEmotionChart';
import { GenderEmotionChart } from '../components/GenderEmotionChart';
import { GeoEmotionMap } from '../components/GeoEmotionMap';
import { EmotionDistributionChart } from '../components/EmotionDistributionChart';
import { PsychoSocialHeatmap } from '../components/PsychoSocialHeatmap';
import { MarketingRadarChart } from '../components/MarketingRadarChart';
import { MarketingMixRadarChart } from '../components/MarketingMixRadarChart';

export function Dashboard() {
  const [textInput, setTextInput] = useState('');
  const navigate = useNavigate();
  const uploadMutation = useUploadDocument();
  const { data: documents = [], isLoading } = useGetAllDocuments();

  // Compute dataset status directly from documents
  const hasActiveDataset = useMemo(() => documents.length > 0, [documents.length]);

  const handleAnalyze = async () => {
    if (!textInput.trim()) {
      toast.error('Silakan masukkan teks untuk dianalisis');
      return;
    }

    try {
      await uploadMutation.mutateAsync(textInput);
      toast.success('Teks berhasil dianalisis!');
      setTextInput('');
      // Small delay to ensure queries refetch
      setTimeout(() => {
        navigate({ to: '/analysis' });
      }, 100);
    } catch (error) {
      toast.error('Gagal menganalisis teks');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        await uploadMutation.mutateAsync(content);
        toast.success('File berhasil diupload dan dianalisis!');
        // Small delay to ensure queries refetch
        setTimeout(() => {
          navigate({ to: '/analysis' });
        }, 100);
      } catch (error) {
        toast.error('Gagal mengupload file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col justify-center space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by Transformer Ensemble
          </div>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Analisis Emosi Konsumen Motor Listrik
          </h1>
          <p className="text-lg text-muted-foreground">
            Gunakan teknologi AI ensemble (BERT, RoBERTa, DistilBERT) dengan framework Condorcet's Jury
            Theorem untuk menganalisis sentimen dan emosi dari komentar media sosial.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate({ to: '/analysis' })}>
              <BarChart3 className="mr-2 h-5 w-5" />
              Lihat Analisis
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: '/metrics' })}>
              <TrendingUp className="mr-2 h-5 w-5" />
              Metrik Performa
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-chart-1/20 to-chart-2/20 blur-3xl" />
          <img
            src="/assets/generated/electric-motorcycle-hero.dim_800x600.png"
            alt="Electric Motorcycle"
            className="relative rounded-2xl shadow-2xl"
          />
        </div>
      </section>

      {/* Quick Analysis Section */}
      <section className="mb-12">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Analisis Cepat
            </CardTitle>
            <CardDescription>
              Masukkan teks atau upload file untuk analisis emosi instan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Input Teks</Label>
              <Textarea
                id="text-input"
                placeholder="Contoh: Motor listrik Gesits ini sangat bagus, saya sangat puas dengan performanya..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analisis Sekarang
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv,.json"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Overview */}
      <section className="mb-12 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analisis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Dokumen dianalisis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Ensemble</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">BERT, RoBERTa, DistilBERT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Algoritma CJT</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">JC, JA, JD</p>
          </CardContent>
        </Card>
      </section>

      {/* Charts and Recent Analysis */}
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <EmotionChart 
            key={`emotion-chart-${documents.length}`}
            documents={documents}
            hasActiveDataset={hasActiveDataset}
          />
          <RecentAnalysis documents={documents.slice(0, 5)} />
        </div>
        
        {/* Emotion Distribution Chart - key ensures re-render on document count change */}
        <EmotionDistributionChart 
          key={`emotion-dist-${documents.length}`}
          documents={documents} 
          hasActiveDataset={hasActiveDataset} 
        />
        
        {/* Brand Emotion Chart - key ensures re-render on document count change */}
        <BrandEmotionChart 
          key={`brand-emotion-${documents.length}`}
          documents={documents} 
        />
        
        {/* Gender & Location Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GenderEmotionChart key={`gender-${documents.length}`} />
          <GeoEmotionMap key={`geo-${documents.length}`} />
        </div>
        
        {/* Psycho-Social Heatmap - key ensures re-render on document count change */}
        <PsychoSocialHeatmap 
          key={`psycho-${documents.length}`}
          documents={documents} 
          hasActiveDataset={hasActiveDataset} 
        />
        
        {/* Marketing Radar Charts - key ensures re-render on document count change */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MarketingRadarChart 
            key={`marketing-${documents.length}`}
            documents={documents} 
            hasActiveDataset={hasActiveDataset} 
          />
          <MarketingMixRadarChart 
            key={`marketing-mix-${documents.length}`}
            documents={documents} 
            hasActiveDataset={hasActiveDataset} 
          />
        </div>
      </section>
    </div>
  );
}
