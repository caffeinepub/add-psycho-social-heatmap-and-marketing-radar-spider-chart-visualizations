import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ParseDiagnostics } from '@/lib/datasetIngestion';

export interface DatasetUploadStatusProps {
  state: 'idle' | 'parsing' | 'validating' | 'uploading' | 'done' | 'error';
  totalRows?: number;
  uploadedCount?: number;
  failedCount?: number;
  skippedCount?: number;
  errorMessage?: string;
  diagnostics?: ParseDiagnostics;
}

export function DatasetUploadStatus({
  state,
  totalRows = 0,
  uploadedCount = 0,
  failedCount = 0,
  skippedCount = 0,
  errorMessage,
  diagnostics,
}: DatasetUploadStatusProps) {
  if (state === 'idle') {
    return null;
  }

  // Stage-based progress: parsing (25%), validating (50%), uploading (75-100%)
  const getStageProgress = () => {
    if (state === 'parsing') return 25;
    if (state === 'validating') return 50;
    if (state === 'uploading') return 75;
    if (state === 'done') return 100;
    return 0;
  };

  const progress = getStageProgress();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state === 'parsing' && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Parsing File...
            </>
          )}
          {state === 'validating' && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Validating Data...
            </>
          )}
          {state === 'uploading' && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Uploading Dataset...
            </>
          )}
          {state === 'done' && uploadedCount > 0 && (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Upload Complete
            </>
          )}
          {state === 'error' && (
            <>
              <XCircle className="h-5 w-5 text-destructive" />
              Upload Failed
            </>
          )}
        </CardTitle>
        <CardDescription>
          {state === 'parsing' && 'Reading and parsing file contents...'}
          {state === 'validating' && 'Checking structure and required columns...'}
          {state === 'uploading' && `Uploading ${totalRows} rows to backend...`}
          {state === 'done' && uploadedCount > 0 && 'Dataset successfully uploaded and ready for analysis'}
          {state === 'error' && 'An error occurred while processing the file'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(state === 'parsing' || state === 'validating' || state === 'uploading') && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {state === 'parsing' && 'Parsing...'}
                {state === 'validating' && 'Validating...'}
                {state === 'uploading' && 'Uploading...'}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {state === 'done' && uploadedCount > 0 && (
          <div className="space-y-2">
            <Alert className="border-green-600/20 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <div className="space-y-1">
                  <div className="font-medium">Upload successful!</div>
                  <div className="text-sm">
                    • {uploadedCount} rows uploaded successfully
                    {skippedCount > 0 && ` • ${skippedCount} rows skipped (empty text)`}
                    {failedCount > 0 && ` • ${failedCount} rows failed`}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {state === 'error' && errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Error Details:</div>
                <div className="whitespace-pre-wrap font-mono text-xs bg-destructive/10 p-3 rounded border border-destructive/20 max-h-48 overflow-y-auto">
                  {errorMessage}
                </div>
                
                {diagnostics && (
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="font-medium text-sm">Parsing Diagnostics:</div>
                    
                    <div className="bg-destructive/5 p-2 rounded border border-destructive/10">
                      <div><strong>Normalized Headers:</strong></div>
                      <div className="font-mono text-[10px] mt-1">
                        [{diagnostics.normalizedHeaders.join(', ')}]
                      </div>
                    </div>
                    
                    <div className="bg-destructive/5 p-2 rounded border border-destructive/10">
                      <div><strong>Text Column Index:</strong> {diagnostics.textIndex >= 0 ? diagnostics.textIndex : 'Not found'}</div>
                      {diagnostics.recoveryAppliedCount > 0 && (
                        <div className="mt-1 text-orange-600 dark:text-orange-400">
                          ⚠ Recovery applied to {diagnostics.recoveryAppliedCount} rows
                        </div>
                      )}
                    </div>
                    
                    {diagnostics.sampleRows && diagnostics.sampleRows.length > 0 && (
                      <div className="bg-destructive/5 p-2 rounded border border-destructive/10">
                        <div><strong>Sample Rows (first {diagnostics.sampleRows.length}):</strong></div>
                        {diagnostics.sampleRows.map((sample, idx) => {
                          const previewFields = sample.fields.slice(0, 5).map(f => {
                            const truncated = f.slice(0, 20);
                            const ellipsis = f.length > 20 ? '...' : '';
                            return `"${truncated}${ellipsis}"`;
                          }).join(', ');
                          const moreIndicator = sample.fields.length > 5 ? ', ...' : '';
                          
                          return (
                            <div key={idx} className="mt-1 font-mono text-[10px]">
                              <div>Row {sample.rowIndex}: {sample.fieldCount} fields</div>
                              <div className="ml-2 text-muted-foreground truncate">
                                [{previewFields}{moreIndicator}]
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {(state === 'done' || state === 'error') && skippedCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {skippedCount} rows skipped due to empty &quot;text&quot; column
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
