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
import { mapUploadError } from '../lib/icReplicaErrors';

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
      const { summary, details } = mapUploadError(error);
      toast.error(summary);
      console.error('Upload error:', details);
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
          const { summary, details } = mapUploadError(error);
          toast.error(summary);
          console.error('Upload error:', details);
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
          toast.error(parseResult.error || 'Failed to parse file');
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
            errorMessage: 'No valid rows to upload',
            skippedCount: parseResult.skippedCount,
          });
          toast.error('No valid rows to upload');
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
          
          const result = await batchUploadMutation.mutateAsync({
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
            uploadedCount: result.success.length,
            failedCount: result.failed.length,
            skippedCount: parseResult.skippedCount,
          });

          toast.success(`Dataset uploaded successfully! ${result.success.length} rows uploaded.`);
          
          // Navigate to analysis page after a short delay
          setTimeout(() => {
            navigate({ to: '/analysis' });
          }, 2000);
        } catch (error) {
          const { summary, details } = mapUploadError(error);
          
          setUploadStatus({
            state: 'error',
            errorMessage: `${summary}\n\nTechnical details: ${details}`,
            totalRows: parseResult.validCount,
            uploadedCount: 0,
            skippedCount: parseResult.skippedCount,
          });
          
          toast.error(summary);
          console.error('Batch upload error:', details);
        }
        return;
      }

      // Unsupported file type
      toast.error('Unsupported file type. Please upload .txt, .csv, or .json files.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Text Content */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 text-sm backdrop-blur-sm w-fit">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">AI-Powered Emotion Analysis</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-blue-600 sm:text-5xl lg:text-6xl">
                Pahami Emosi Pelanggan
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Analisis komentar media sosial dan ulasan untuk mengungkap wawasan emosional tentang sepeda motor listrik Indonesia. 
                Buat keputusan berbasis data dengan analisis sentimen yang canggih.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/analysis' })} className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  View Analysis
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/metrics' })} className="gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Model Metrics
                </Button>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border bg-background/50 shadow-2xl backdrop-blur-sm lg:h-[400px]">
                <img
                  src="/assets/generated/electric-motorcycle-hero.dim_800x600.png"
                  alt="Electric Motorcycle Analysis"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Quick Analysis Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quick Analysis</h2>
                <p className="text-sm text-muted-foreground">Analyze text or upload datasets instantly</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Text Input Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Analyze Text
                  </CardTitle>
                  <CardDescription>
                    Enter text to analyze emotions and sentiment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input">Text Input</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Enter text to analyze (e.g., social media comment, review)..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={uploadMutation.isPending || !textInput.trim()}
                    className="w-full gap-2"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* File Upload Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload Dataset
                  </CardTitle>
                  <CardDescription>
                    Upload .txt, .csv, or .json files for batch analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">File Upload</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            TXT, CSV, or JSON files
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".txt,.csv,.json"
                          onChange={handleFileUpload}
                          disabled={uploadMutation.isPending || batchUploadMutation.isPending}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• <strong>.txt</strong>: Single document analysis</p>
                    <p>• <strong>.csv/.json</strong>: Batch dataset upload with required columns</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dataset Upload Status */}
            {uploadStatus.state !== 'idle' && (
              <DatasetUploadStatus {...uploadStatus} />
            )}
          </section>

          {/* Statistics Cards */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dataset Overview</h2>
                <p className="text-sm text-muted-foreground">Current analysis statistics</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Documents</CardDescription>
                  <CardTitle className="text-3xl">{isLoading ? '...' : documents.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveDataset ? 'Active dataset' : 'No data yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Analysis Status</CardDescription>
                  <CardTitle className="text-3xl">
                    {hasActiveDataset ? '✓' : '—'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveDataset ? 'Ready for insights' : 'Upload data to begin'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Emotion Categories</CardDescription>
                  <CardTitle className="text-3xl">5</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Interest, Trust, Fear, Skepticism, Satisfaction
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>AI Models</CardDescription>
                  <CardTitle className="text-3xl">3</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    BERT, RoBERTa, DistilBERT
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Visualizations Grid */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Emotion Insights</h2>
                <p className="text-sm text-muted-foreground">Visual analysis of emotional patterns</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <EmotionChart documents={documents} />
              <EmotionDistributionChart documents={documents} />
              <BrandEmotionChart documents={documents} />
              <GenderEmotionChart />
              <GeoEmotionMap />
              <RecentAnalysis documents={documents} />
            </div>
          </section>

          {/* Advanced Metrics */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Advanced Metrics</h2>
                <p className="text-sm text-muted-foreground">Psycho-social and marketing insights</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PsychoSocialHeatmap documents={documents} />
              <MarketingRadarChart documents={documents} />
              <MarketingMixRadarChart documents={documents} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
