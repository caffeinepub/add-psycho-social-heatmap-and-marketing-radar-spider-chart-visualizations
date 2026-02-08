import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import type { Document } from '../backend';
import { mockEmotionAnalysis } from '../lib/mockData';

interface RecentAnalysisProps {
  documents: Document[];
}

export function RecentAnalysis({ documents }: RecentAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Analisis Terbaru
        </CardTitle>
        <CardDescription>5 dokumen terakhir yang dianalisis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada analisis. Mulai dengan menginput teks di atas.
            </div>
          ) : (
            documents.map((doc) => {
              const analysis = mockEmotionAnalysis(doc.content);
              return (
                <div
                  key={doc.id.toString()}
                  className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {analysis.primaryEmotion}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(analysis.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{doc.content}</p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
