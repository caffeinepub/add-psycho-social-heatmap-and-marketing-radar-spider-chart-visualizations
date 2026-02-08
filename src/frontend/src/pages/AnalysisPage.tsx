import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Tag, Trash2, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useGetAllDocuments, useDeleteDocument } from '../hooks/useQueries';
import { mockEmotionAnalysis } from '../lib/mockData';
import { EmotionChart } from '../components/EmotionChart';
import { BrandEmotionChart } from '../components/BrandEmotionChart';
import { TemporalEvolutionChart } from '../components/TemporalEvolutionChart';
import { GenderEmotionChart } from '../components/GenderEmotionChart';
import { GeoEmotionMap } from '../components/GeoEmotionMap';
import { EmotionDistributionChart } from '../components/EmotionDistributionChart';
import { CleaningLogPanel } from '../components/CleaningLogPanel';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

const emotionColors: Record<string, string> = {
  interest: 'bg-chart-1',
  trust: 'bg-chart-2',
  fear: 'bg-chart-3',
  skepticism: 'bg-chart-4',
  satisfaction: 'bg-chart-5',
  minat: 'bg-chart-1',
  kepercayaan: 'bg-chart-2',
  ketakutan: 'bg-chart-3',
  skeptisisme: 'bg-chart-4',
  kepuasan: 'bg-chart-5',
};

const brands = [
  'Semua Merek',
  'Gesits',
  'Alva',
  'Selis',
  'Viar Q1',
  'Polytron Fox-R',
  'Yadea',
  'NIU',
  'Volta',
  'United T1800',
  'Davigo',
];

export function AnalysisPage() {
  const { data: documents = [], isLoading } = useGetAllDocuments();
  const deleteMutation = useDeleteDocument();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Semua Merek');
  const [selectedEmotion, setSelectedEmotion] = useState('Semua Emosi');

  // Compute dataset status directly from full documents (not filtered)
  const hasActiveDataset = useMemo(() => documents.length > 0, [documents.length]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const analysis = mockEmotionAnalysis(doc.content);
      const matchesSearch = doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand =
        selectedBrand === 'Semua Merek' ||
        (analysis.brand && analysis.brand.toLowerCase().includes(selectedBrand.toLowerCase()));
      const matchesEmotion =
        selectedEmotion === 'Semua Emosi' || 
        analysis.primaryEmotion === selectedEmotion.toLowerCase() ||
        analysis.primaryEmotion.toLowerCase() === selectedEmotion.toLowerCase();

      return matchesSearch && matchesBrand && matchesEmotion;
    });
  }, [documents, searchQuery, selectedBrand, selectedEmotion]);

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Dokumen berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus dokumen');
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Analisis Emosi</h1>
        <p className="text-muted-foreground">
          Jelajahi hasil analisis emosi dari dataset yang telah diupload
        </p>
      </div>

      {/* Dataset Status Indicator */}
      {hasActiveDataset && (
        <Card className="mb-6 border-green-500/50 bg-green-500/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Dataset Aktif</p>
                <p className="text-sm text-muted-foreground">
                  {documents.length} dokumen tersedia untuk analisis
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/report' })}
            >
              View Strategic Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cleaning Log Panel - only show when dataset is active */}
      {hasActiveDataset && <CleaningLogPanel />}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">
                <Search className="mr-2 inline h-4 w-4" />
                Cari Teks
              </Label>
              <Input
                id="search"
                placeholder="Cari dalam dokumen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">
                <Tag className="mr-2 inline h-4 w-4" />
                Merek Motor
              </Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotion">
                <Tag className="mr-2 inline h-4 w-4" />
                Jenis Emosi
              </Label>
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger id="emotion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Emosi">Semua Emosi</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                  <SelectItem value="fear">Fear</SelectItem>
                  <SelectItem value="skepticism">Skepticism</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Menampilkan {filteredDocuments.length} dari {documents.length} dokumen
          </div>
        </CardContent>
      </Card>

      {/* Visualizations - use full documents for dataset status, filtered for display */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brands">Per Merek</TabsTrigger>
          <TabsTrigger value="demographics">Demografis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <EmotionChart 
              key={`emotion-chart-analysis-${filteredDocuments.length}-${documents.length}`}
              documents={filteredDocuments}
              hasActiveDataset={hasActiveDataset}
            />
            <EmotionDistributionChart 
              key={`emotion-dist-analysis-${filteredDocuments.length}-${documents.length}`}
              documents={filteredDocuments} 
              hasActiveDataset={hasActiveDataset}
            />
          </div>
          <TemporalEvolutionChart 
            key={`temporal-${filteredDocuments.length}`}
            documents={filteredDocuments} 
          />
        </TabsContent>
        <TabsContent value="brands" className="space-y-6">
          <BrandEmotionChart 
            key={`brand-analysis-${filteredDocuments.length}`}
            documents={filteredDocuments} 
          />
        </TabsContent>
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GenderEmotionChart key={`gender-analysis-${documents.length}`} />
            <GeoEmotionMap key={`geo-analysis-${documents.length}`} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Dokumen</CardTitle>
          <CardDescription>Semua dokumen yang telah dianalisis</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              {documents.length === 0 
                ? 'Belum ada dokumen yang dianalisis'
                : 'Tidak ada dokumen yang sesuai dengan filter'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => {
                const analysis = mockEmotionAnalysis(doc.content);
                return (
                  <div
                    key={doc.id.toString()}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={emotionColors[analysis.primaryEmotion] || 'bg-muted'}>
                          {analysis.primaryEmotion}
                        </Badge>
                        {analysis.brand && (
                          <Badge variant="outline">{analysis.brand}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Confidence: {(analysis.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{doc.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
