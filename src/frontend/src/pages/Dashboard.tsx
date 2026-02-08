import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useUploadDocument, useUploadDocumentsBatch, useGetAllDocuments } from '../hooks/useQueries';
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
import { DatasetUploadStatus, DatasetUploadStatusProps } from '../components/DatasetUploadStatus';
import { parseDatasetFile } from '../lib/datasetIngestion';

export function Dashboard() {
  const [textInput, setTextInput] = useState('');
  const [uploadStatus, setUploadStatus] = useState<DatasetUploadStatusProps>({ state: 'idle' });
  const navigate = useNavigate();
  const uploadMutation = useUploadDocument();
  const batchUploadMutation = useUploadDocumentsBatch();
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const filename = file.name;
    const extension = filename.toLowerCase().split('.').pop();

    // Reset upload status
    setUploadStatus({ state: 'idle' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;

      // Handle .txt files as before (single document upload)
      if (extension === 'txt') {
        try {
          await uploadMutation.mutateAsync(content);
          toast.success('File berhasil diupload dan dianalisis!');
          setTimeout(() => {
            navigate({ to: '/analysis' });
          }, 100);
        } catch (error) {
          toast.error('Gagal mengupload file');
        }
        return;
      }

      // Handle .csv and .json files (dataset upload)
      if (extension === 'csv' || extension === 'json') {
        // Step 1: Parse
        setUploadStatus({ state: 'parsing' });
        
        const parseResult = parseDatasetFile(content, filename);

        if (!parseResult.success) {
          setUploadStatus({
            state: 'error',
            errorMessage: parseResult.error,
          });
          toast.error(parseResult.error || 'Gagal mem-parse file');
          return;
        }

        // Step 2: Validate
        setUploadStatus({ 
          state: 'validating',
          totalRows: parseResult.validCount,
          skippedCount: parseResult.skippedCount,
        });

        if (parseResult.validCount === 0) {
          setUploadStatus({
            state: 'error',
            errorMessage: 'Tidak ada baris valid untuk diupload',
            skippedCount: parseResult.skippedCount,
          });
          toast.error('Tidak ada baris valid untuk diupload');
          return;
        }

        // Step 3: Upload batch
        setUploadStatus({
          state: 'uploading',
          totalRows: parseResult.validCount,
          uploadedCount: 0,
          skippedCount: parseResult.skippedCount,
        });

        try {
          const contents = parseResult.rows.map(row => row.text);
          
          const results = await batchUploadMutation.mutateAsync({
            contents,
            onProgress: (uploaded, total) => {
              setUploadStatus({
                state: 'uploading',
                totalRows: total,
                uploadedCount: uploaded,
                skippedCount: parseResult.skippedCount,
              });
            },
          });

          // Step 4: Done
          setUploadStatus({
            state: 'done',
            totalRows: parseResult.validCount,
            uploadedCount: results.success.length,
            failedCount: results.failed.length,
            skippedCount: parseResult.skippedCount,
          });

          if (results.success.length > 0) {
            toast.success(`Dataset berhasil diupload! ${results.success.length} dokumen ditambahkan.`);
            setTimeout(() => {
              setUploadStatus({ state: 'idle' });
              navigate({ to: '/analysis' });
            }, 2000);
          } else {
            toast.error('Semua baris gagal diupload');
          }
        } catch (error) {
          setUploadStatus({
            state: 'error',
            errorMessage: error instanceof Error ? error.message : 'Gagal mengupload dataset',
            totalRows: parseResult.validCount,
            skippedCount: parseResult.skippedCount,
          });
          toast.error('Gagal mengupload dataset');
        }
        return;
      }

      // Unsupported file type
      toast.error('Format file tidak didukung. Gunakan .txt, .csv, atau .json');
    };

    reader.onerror = () => {
      setUploadStatus({
        state: 'error',
        errorMessage: 'Gagal membaca file',
      });
      toast.error('Gagal membaca file');
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
              Masukkan teks atau upload file (.txt, .csv, .json) untuk analisis emosi instan
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
              <Button onClick={handleAnalyze} disabled={uploadMutation.isPending || batchUploadMutation.isPending}>
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
              <Button variant="outline" asChild disabled={batchUploadMutation.isPending}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv,.json"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={batchUploadMutation.isPending}
                  />
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dataset Upload Status */}
      {uploadStatus.state !== 'idle' && (
        <section className="mb-12">
          <DatasetUploadStatus {...uploadStatus} />
        </section>
      )}

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
