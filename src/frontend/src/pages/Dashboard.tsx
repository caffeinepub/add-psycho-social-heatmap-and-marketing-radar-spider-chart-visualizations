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
      toast.error('Please enter text to analyze');
      return;
    }

    try {
      await uploadMutation.mutateAsync(textInput);
      toast.success('Text analyzed successfully!');
      setTextInput('');
      // Small delay to ensure queries refetch
      setTimeout(() => {
        navigate({ to: '/analysis' });
      }, 100);
    } catch (error) {
      const { summary, details } = mapUploadError(error);
      toast.error(summary);
      console.error('Upload error - Summary:', summary);
      console.error('Upload error - Technical details:\n', details);
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
          toast.success('Text file uploaded successfully!');
        } catch (error) {
          const { summary, details } = mapUploadError(error);
          toast.error(summary);
          console.error('Upload error - Summary:', summary);
          console.error('Upload error - Technical details:\n', details);
        }
        return;
      }

      // Handle CSV/JSON files with batch upload
      if (extension === 'csv' || extension === 'json') {
        // Stage 1: Parsing
        setUploadStatus({ state: 'parsing' });

        try {
          const parseResult = parseDatasetFile(content, extension);

          if (!parseResult.success) {
            setUploadStatus({
              state: 'error',
              errorMessage: parseResult.error || 'Failed to parse file',
              diagnostics: parseResult.diagnostics,
            });
            return;
          }

          // Extract text content from parsed rows
          const contents = parseResult.rows.map(row => row.text);
          const skippedCount = parseResult.skippedCount;

          if (contents.length === 0) {
            setUploadStatus({
              state: 'error',
              errorMessage: 'No valid rows found in the dataset. Please check that the "text" column contains data.',
              diagnostics: parseResult.diagnostics,
            });
            return;
          }

          // Stage 2: Validating
          setUploadStatus({
            state: 'validating',
            totalRows: contents.length,
            skippedCount,
          });

          // Small delay to show validation stage
          await new Promise(resolve => setTimeout(resolve, 300));

          // Stage 3: Uploading (single batch call)
          setUploadStatus({
            state: 'uploading',
            totalRows: contents.length,
            uploadedCount: 0,
            skippedCount,
          });

          const result = await batchUploadMutation.mutateAsync(contents);

          // Stage 4: Done
          setUploadStatus({
            state: 'done',
            totalRows: contents.length,
            uploadedCount: result.success.length,
            failedCount: result.failed.length,
            skippedCount,
          });

          toast.success(`Dataset uploaded: ${result.success.length} rows processed successfully!`);
        } catch (error) {
          const { summary, details } = mapUploadError(error);
          setUploadStatus({
            state: 'error',
            errorMessage: details,
          });
          toast.error(summary);
          console.error('Batch upload error - Summary:', summary);
          console.error('Batch upload error - Technical details:\n', details);
        }
        return;
      }

      // Unsupported file type
      toast.error('Unsupported file type. Please upload CSV, JSON, or TXT files.');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze sentiment and emotions from text data using advanced AI models
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/analysis' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Documents analyzed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/metrics' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Metrics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active models</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/purchase-intention' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Intent</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AI</div>
            <p className="text-xs text-muted-foreground">Powered insights</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/report' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strategic Report</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PDF</div>
            <p className="text-xs text-muted-foreground">Export ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Text Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Text Analysis
            </CardTitle>
            <CardDescription>Analyze individual text for emotion and sentiment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Enter text to analyze</Label>
              <Textarea
                id="text-input"
                placeholder="Type or paste your text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!textInput.trim() || uploadMutation.isPending}
              className="w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Dataset Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dataset Upload
            </CardTitle>
            <CardDescription>Upload CSV, JSON, or TXT files for batch analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select file</Label>
              <div className="flex items-center gap-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={batchUploadMutation.isPending}
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={batchUploadMutation.isPending}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, JSON, TXT (max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status */}
      <DatasetUploadStatus {...uploadStatus} />

      {/* Visualizations Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EmotionChart documents={documents} hasActiveDataset={hasActiveDataset} />
        <EmotionDistributionChart documents={documents} hasActiveDataset={hasActiveDataset} />
        <BrandEmotionChart documents={documents} />
        <GenderEmotionChart documents={documents} hasActiveDataset={hasActiveDataset} />
        <div className="lg:col-span-2">
          <GeoEmotionMap />
        </div>
        <PsychoSocialHeatmap documents={documents} hasActiveDataset={hasActiveDataset} />
        <MarketingRadarChart documents={documents} hasActiveDataset={hasActiveDataset} />
        <div className="lg:col-span-2">
          <MarketingMixRadarChart documents={documents} hasActiveDataset={hasActiveDataset} />
        </div>
      </div>

      {/* Recent Analysis */}
      <RecentAnalysis documents={documents} />
    </div>
  );
}
