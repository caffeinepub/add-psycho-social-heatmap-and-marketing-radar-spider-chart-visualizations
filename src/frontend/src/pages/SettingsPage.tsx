import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings, Brain, Zap, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SettingsPage() {
  const [defaultEnsemble, setDefaultEnsemble] = useState('jd');
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.7]);
  const [enableBERT, setEnableBERT] = useState(true);
  const [enableRoBERTa, setEnableRoBERTa] = useState(true);
  const [enableDistilBERT, setEnableDistilBERT] = useState(true);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [realtimeAdaptation, setRealtimeAdaptation] = useState(true);

  const handleSave = () => {
    toast.success('Pengaturan berhasil disimpan');
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Konfigurasi model ensemble dan parameter analisis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Konfigurasi Model
            </CardTitle>
            <CardDescription>Pilih model transformer yang akan digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bert">BERT</Label>
                <p className="text-sm text-muted-foreground">
                  Bidirectional Encoder Representations
                </p>
              </div>
              <Switch id="bert" checked={enableBERT} onCheckedChange={setEnableBERT} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="roberta">RoBERTa</Label>
                <p className="text-sm text-muted-foreground">
                  Robustly Optimized BERT Approach
                </p>
              </div>
              <Switch id="roberta" checked={enableRoBERTa} onCheckedChange={setEnableRoBERTa} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="distilbert">DistilBERT</Label>
                <p className="text-sm text-muted-foreground">
                  Distilled version of BERT (faster)
                </p>
              </div>
              <Switch
                id="distilbert"
                checked={enableDistilBERT}
                onCheckedChange={setEnableDistilBERT}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ensemble Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Konfigurasi Ensemble
            </CardTitle>
            <CardDescription>Pengaturan algoritma Condorcet's Jury Theorem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ensemble">Algoritma Default</Label>
              <Select value={defaultEnsemble} onValueChange={setDefaultEnsemble}>
                <SelectTrigger id="ensemble">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jc">Jury Classic (JC)</SelectItem>
                  <SelectItem value="ja">Jury Adaptive (JA)</SelectItem>
                  <SelectItem value="jd">Jury Dynamic (JD)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {defaultEnsemble === 'jc' && 'Voting sederhana dari ketiga model'}
                {defaultEnsemble === 'ja' && 'Pembelajaran memori adaptif'}
                {defaultEnsemble === 'jd' && 'Reinforcement learning untuk adaptasi real-time'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="adaptive">Adaptive Learning</Label>
                <p className="text-sm text-muted-foreground">
                  Pembelajaran dari prediksi sebelumnya
                </p>
              </div>
              <Switch
                id="adaptive"
                checked={adaptiveLearning}
                onCheckedChange={setAdaptiveLearning}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="realtime">Real-time Adaptation</Label>
                <p className="text-sm text-muted-foreground">
                  Adaptasi dinamis menggunakan RL
                </p>
              </div>
              <Switch
                id="realtime"
                checked={realtimeAdaptation}
                onCheckedChange={setRealtimeAdaptation}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analysis Parameters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Parameter Analisis
            </CardTitle>
            <CardDescription>Sesuaikan threshold dan parameter deteksi emosi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="confidence">Confidence Threshold</Label>
                <span className="text-sm font-medium">{(confidenceThreshold[0] * 100).toFixed(0)}%</span>
              </div>
              <Slider
                id="confidence"
                min={0.5}
                max={1}
                step={0.05}
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
              />
              <p className="text-sm text-muted-foreground">
                Minimum confidence score untuk klasifikasi emosi
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">Reset ke Default</Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
