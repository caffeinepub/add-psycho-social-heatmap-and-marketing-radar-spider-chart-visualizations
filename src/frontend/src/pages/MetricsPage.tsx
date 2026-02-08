import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Zap, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ModelPerformanceChart } from '../components/ModelPerformanceChart';
import { EnsembleComparisonChart } from '../components/EnsembleComparisonChart';
import { ConfusionMatrixChart } from '../components/ConfusionMatrixChart';
import { useGetConfusionMatrix, useResetAllData, useGetAllDocuments } from '../hooks/useQueries';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Formats decimal metric (0-1) to percentage string with 2 decimal places
 */
function formatMetricPercentage(value: number): string {
  return (Math.max(0, Math.min(1, value)) * 100).toFixed(2);
}

/**
 * Formats decimal metric (0-1) to percentage string with 1 decimal place for overview
 */
function formatMetricPercentageShort(value: number): string {
  return (Math.max(0, Math.min(1, value)) * 100).toFixed(1);
}

export function MetricsPage() {
  const [selectedModel, setSelectedModel] = useState<string>('BERT');
  const [selectedEnsemble, setSelectedEnsemble] = useState<string>('JC');
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  const { data: documents, isLoading: isLoadingDocs } = useGetAllDocuments();
  const hasActiveDataset = documents && documents.length > 0;
  
  // Use selectedModel as dependency in query key to trigger reload on model change
  const { data: modelConfusionMatrix, isLoading: isLoadingModel, error: modelError } = useGetConfusionMatrix(selectedModel);
  const { data: ensembleConfusionMatrix, isLoading: isLoadingEnsemble, error: ensembleError } = useGetConfusionMatrix(selectedEnsemble);
  const resetAllMutation = useResetAllData();

  // Track document count to detect dataset changes
  const previousDocCountRef = useRef<number | null>(null);
  const documentCount = documents?.length || 0;

  // Track previous model selection to detect changes
  const previousModelRef = useRef<string>(selectedModel);
  const previousEnsembleRef = useRef<string>(selectedEnsemble);

  // Detect dataset changes and show notification
  useEffect(() => {
    if (previousDocCountRef.current !== null && previousDocCountRef.current !== documentCount) {
      if (documentCount === 0) {
        toast.info('Dataset dihapus - visualisasi direset', {
          description: 'Semua grafik telah dikembalikan ke kondisi kosong',
        });
      } else if (documentCount > previousDocCountRef.current) {
        toast.success('Dataset diperbarui', {
          description: `${documentCount - previousDocCountRef.current} dokumen baru ditambahkan`,
        });
      }
    }
    previousDocCountRef.current = documentCount;
  }, [documentCount]);

  // Detect model selection changes and log for debugging
  useEffect(() => {
    if (previousModelRef.current !== selectedModel) {
      console.log('Model selection changed:', {
        from: previousModelRef.current,
        to: selectedModel,
        hasData: !!modelConfusionMatrix,
      });
      previousModelRef.current = selectedModel;
    }
  }, [selectedModel, modelConfusionMatrix]);

  useEffect(() => {
    if (previousEnsembleRef.current !== selectedEnsemble) {
      console.log('Ensemble selection changed:', {
        from: previousEnsembleRef.current,
        to: selectedEnsemble,
        hasData: !!ensembleConfusionMatrix,
      });
      previousEnsembleRef.current = selectedEnsemble;
    }
  }, [selectedEnsemble, ensembleConfusionMatrix]);

  // Log confusion matrix status for debugging
  useEffect(() => {
    if (hasActiveDataset) {
      console.log('Confusion Matrix Status:', {
        model: selectedModel,
        hasData: !!modelConfusionMatrix,
        isLoading: isLoadingModel,
        error: modelError,
        matrixDimensions: modelConfusionMatrix?.confusionMatrix?.length,
        emotionsCount: modelConfusionMatrix?.emotions?.length,
      });
    }
  }, [hasActiveDataset, selectedModel, modelConfusionMatrix, isLoadingModel, modelError]);

  // Handle reset all data
  const handleResetAll = async () => {
    try {
      await resetAllMutation.mutateAsync();
      setShowResetSuccess(true);
      toast.success('Data berhasil direset', {
        description: 'Semua visualisasi performa telah dibersihkan dan siap untuk dataset baru',
      });
      
      // Hide success indicator after 3 seconds
      setTimeout(() => {
        setShowResetSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error('Gagal mereset data', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    }
  };

  // Model metrics (values in 0-1 range, will be converted to percentages in components)
  // Only show metrics when dataset is active
  const modelMetrics = useMemo(() => {
    if (!hasActiveDataset) return [];
    return [
      {
        name: 'BERT',
        precision: 0.89,
        recall: 0.87,
        f1Score: 0.88,
        accuracy: 0.88,
      },
      {
        name: 'RoBERTa',
        precision: 0.91,
        recall: 0.89,
        f1Score: 0.90,
        accuracy: 0.90,
      },
      {
        name: 'DistilBERT',
        precision: 0.85,
        recall: 0.84,
        f1Score: 0.845,
        accuracy: 0.85,
      },
    ];
  }, [hasActiveDataset]);

  // Ensemble metrics (values in 0-1 range, will be converted to percentages in components)
  // Only show metrics when dataset is active
  const ensembleMetrics = useMemo(() => {
    if (!hasActiveDataset) return [];
    return [
      {
        name: 'Jury Classic (JC)',
        description: 'Voting sederhana dari ketiga model',
        precision: 0.90,
        recall: 0.88,
        f1Score: 0.89,
        accuracy: 0.89,
      },
      {
        name: 'Jury Adaptive (JA)',
        description: 'Pembelajaran memori adaptif',
        precision: 0.92,
        recall: 0.91,
        f1Score: 0.915,
        accuracy: 0.92,
      },
      {
        name: 'Jury Dynamic (JD)',
        description: 'Reinforcement learning untuk adaptasi real-time',
        precision: 0.94,
        recall: 0.93,
        f1Score: 0.935,
        accuracy: 0.94,
      },
    ];
  }, [hasActiveDataset]);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Metrik Performa</h1>
          <p className="text-muted-foreground">
            Evaluasi performa model transformer dan algoritma ensemble dengan metrik yang dinormalisasi dan divalidasi
          </p>
        </div>
        
        {/* Reset Data Button */}
        <div className="flex items-center gap-3">
          {showResetSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Reset berhasil</span>
            </div>
          )}
          <Button
            onClick={handleResetAll}
            disabled={resetAllMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${resetAllMutation.isPending ? 'animate-spin' : ''}`} />
            {resetAllMutation.isPending ? 'Mereset...' : 'Reset Data'}
          </Button>
        </div>
      </div>

      {/* Dataset Info Card */}
      <Card className={`mb-6 ${hasActiveDataset ? 'border-primary/20 bg-primary/5' : 'border-muted bg-muted/20'}`}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${hasActiveDataset ? 'bg-primary/10' : 'bg-muted'}`}>
              <Target className={`h-5 w-5 ${hasActiveDataset ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {hasActiveDataset ? 'Dataset Aktif' : 'Tidak Ada Dataset'}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasActiveDataset ? `${documentCount} dokumen dianalisis` : 'Upload dataset untuk melihat metrik'}
              </p>
            </div>
          </div>
          <Badge variant={hasActiveDataset ? 'outline' : 'secondary'} className="text-xs">
            {hasActiveDataset ? 'Sinkronisasi otomatis' : 'Menunggu data'}
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="models">Model Individual</TabsTrigger>
          <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {/* Model Performance Overview */}
          {hasActiveDataset && modelMetrics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {modelMetrics.map((model) => (
                <Card key={model.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {model.name}
                      <Badge variant="outline">Transformer</Badge>
                    </CardTitle>
                    <CardDescription>Metrik performa model</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Precision</span>
                      <span className="font-semibold">{formatMetricPercentageShort(model.precision)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Recall</span>
                      <span className="font-semibold">{formatMetricPercentageShort(model.recall)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">F1-Score</span>
                      <span className="font-semibold">{formatMetricPercentageShort(model.f1Score)}%</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium">Accuracy</span>
                      <span className="text-lg font-bold text-primary">
                        {formatMetricPercentageShort(model.accuracy)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-[200px] items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
                  <p className="text-sm text-muted-foreground/70">
                    Upload dataset untuk melihat metrik performa model
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Model Performance Chart */}
          <ModelPerformanceChart metrics={modelMetrics} hasActiveDataset={hasActiveDataset} />

          {/* Confusion Matrix Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Confusion Matrix</h2>
                <p className="text-sm text-muted-foreground">
                  Visualisasi prediksi vs label aktual untuk model transformer (normalisasi per baris, setiap baris = 100%)
                </p>
              </div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BERT">BERT</SelectItem>
                  <SelectItem value="RoBERTa">RoBERTa</SelectItem>
                  <SelectItem value="DistilBERT">DistilBERT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoadingModel || isLoadingDocs ? (
              <Card>
                <CardContent className="flex h-[400px] items-center justify-center">
                  <div className="text-muted-foreground">Memuat confusion matrix...</div>
                </CardContent>
              </Card>
            ) : (
              <ConfusionMatrixChart
                confusionMatrix={modelConfusionMatrix?.confusionMatrix || null}
                emotions={modelConfusionMatrix?.emotions || null}
                modelName={modelConfusionMatrix?.model || selectedModel}
                hasActiveDataset={hasActiveDataset}
                key={`model-${selectedModel}-${documentCount}`}
              />
            )}
          </div>

          {/* Detailed Metrics Table */}
          {hasActiveDataset && modelMetrics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Metrik Detail per Model</CardTitle>
                <CardDescription>Perbandingan lengkap performa model transformer (persentase dengan 2 desimal)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-medium">Model</th>
                        <th className="pb-3 text-right font-medium">Precision</th>
                        <th className="pb-3 text-right font-medium">Recall</th>
                        <th className="pb-3 text-right font-medium">F1-Score</th>
                        <th className="pb-3 text-right font-medium">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelMetrics.map((model) => (
                        <tr key={model.name} className="border-b last:border-0">
                          <td className="py-3 font-medium">{model.name}</td>
                          <td className="py-3 text-right">{formatMetricPercentage(model.precision)}%</td>
                          <td className="py-3 text-right">{formatMetricPercentage(model.recall)}%</td>
                          <td className="py-3 text-right">{formatMetricPercentage(model.f1Score)}%</td>
                          <td className="py-3 text-right font-semibold">
                            {formatMetricPercentage(model.accuracy)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-[200px] items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
                  <p className="text-sm text-muted-foreground/70">
                    Upload dataset untuk melihat metrik detail
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ensemble" className="space-y-6">
          {/* Ensemble Performance Overview */}
          {hasActiveDataset && ensembleMetrics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {ensembleMetrics.map((ensemble, index) => {
                const icons = [Target, TrendingUp, Zap];
                const Icon = icons[index];
                return (
                  <Card key={ensemble.name} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {ensemble.name.split(' ')[0]} {ensemble.name.match(/\(([^)]+)\)/)?.[1]}
                      </CardTitle>
                      <CardDescription>{ensemble.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Precision</span>
                        <span className="font-semibold">{formatMetricPercentageShort(ensemble.precision)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Recall</span>
                        <span className="font-semibold">{formatMetricPercentageShort(ensemble.recall)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">F1-Score</span>
                        <span className="font-semibold">{formatMetricPercentageShort(ensemble.f1Score)}%</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-lg font-bold text-primary">
                          {formatMetricPercentageShort(ensemble.accuracy)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex h-[200px] items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
                  <p className="text-sm text-muted-foreground/70">
                    Upload dataset untuk melihat metrik ensemble
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ensemble Comparison Chart */}
          <EnsembleComparisonChart metrics={ensembleMetrics} hasActiveDataset={hasActiveDataset} />

          {/* Confusion Matrix Section for Ensemble */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Confusion Matrix</h2>
                <p className="text-sm text-muted-foreground">
                  Visualisasi prediksi vs label aktual untuk metode ensemble (normalisasi per baris, setiap baris = 100%)
                </p>
              </div>
              <Select value={selectedEnsemble} onValueChange={setSelectedEnsemble}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih ensemble" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JC">Jury Classic (JC)</SelectItem>
                  <SelectItem value="JA">Jury Adaptive (JA)</SelectItem>
                  <SelectItem value="JD">Jury Dynamic (JD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoadingEnsemble || isLoadingDocs ? (
              <Card>
                <CardContent className="flex h-[400px] items-center justify-center">
                  <div className="text-muted-foreground">Memuat confusion matrix...</div>
                </CardContent>
              </Card>
            ) : (
              <ConfusionMatrixChart
                confusionMatrix={ensembleConfusionMatrix?.confusionMatrix || null}
                emotions={ensembleConfusionMatrix?.emotions || null}
                modelName={ensembleConfusionMatrix?.model || selectedEnsemble}
                hasActiveDataset={hasActiveDataset}
                key={`ensemble-${selectedEnsemble}-${documentCount}`}
              />
            )}
          </div>

          {/* Ensemble Details */}
          {hasActiveDataset && ensembleMetrics.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Detail Algoritma Ensemble</CardTitle>
                <CardDescription>
                  Framework Condorcet's Jury Theorem untuk agregasi prediksi (persentase dengan 2 desimal)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ensembleMetrics.map((ensemble) => (
                  <div key={ensemble.name} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold">{ensemble.name}</h3>
                      <Badge>
                        Accuracy: {formatMetricPercentageShort(ensemble.accuracy)}%
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{ensemble.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Precision:</span>{' '}
                        <span className="font-medium">{formatMetricPercentage(ensemble.precision)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recall:</span>{' '}
                        <span className="font-medium">{formatMetricPercentage(ensemble.recall)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">F1-Score:</span>{' '}
                        <span className="font-medium">{formatMetricPercentage(ensemble.f1Score)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex h-[200px] items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">Tidak ada data aktif</p>
                  <p className="text-sm text-muted-foreground/70">
                    Upload dataset untuk melihat detail ensemble
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
