import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useGetLatestCleaningLog } from '../hooks/useQueries';

export function CleaningLogPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: cleaningLogs, isLoading } = useGetLatestCleaningLog();

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('selesai') || status.toLowerCase().includes('valid') || status.toLowerCase().includes('aman')) {
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('gagal')) {
      return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
    return <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes('selesai') || status.toLowerCase().includes('valid') || status.toLowerCase().includes('aman')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    }
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('gagal')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            Log Pembersihan Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memuat log pembersihan...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cleaningLogs || cleaningLogs.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Log Pembersihan Data
            </CardTitle>
            <CardDescription>
              Proses pre-processing otomatis sebelum analisis
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-3">
            {cleaningLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{log.step}</span>
                    <Badge variant="outline" className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Final success message */}
            {cleaningLogs.length > 0 && cleaningLogs[cleaningLogs.length - 1].status.toLowerCase().includes('selesai') && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-50 p-3 dark:bg-green-900/10">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-400">
                  Proses cleaning selesai, data siap dianalisis ✅
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
