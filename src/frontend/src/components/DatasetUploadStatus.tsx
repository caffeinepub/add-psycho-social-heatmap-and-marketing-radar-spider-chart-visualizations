import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export interface DatasetUploadStatusProps {
  state: 'idle' | 'parsing' | 'validating' | 'uploading' | 'done' | 'error';
  totalRows?: number;
  uploadedCount?: number;
  failedCount?: number;
  skippedCount?: number;
  errorMessage?: string;
}

export function DatasetUploadStatus({
  state,
  totalRows = 0,
  uploadedCount = 0,
  failedCount = 0,
  skippedCount = 0,
  errorMessage,
}: DatasetUploadStatusProps) {
  if (state === 'idle') {
    return null;
  }

  const progress = totalRows > 0 ? (uploadedCount / totalRows) * 100 : 0;

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
          {state === 'done' && (
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
          {state === 'uploading' && `Uploading ${uploadedCount} of ${totalRows} rows...`}
          {state === 'done' && 'Dataset successfully uploaded and ready for analysis'}
          {state === 'error' && 'An error occurred while processing the file'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === 'uploading' && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{uploadedCount} / {totalRows} rows</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {state === 'done' && (
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
                <div className="whitespace-pre-wrap font-mono text-xs bg-destructive/10 p-2 rounded border border-destructive/20">
                  {errorMessage}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {(state === 'done' || state === 'error') && skippedCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {skippedCount} rows skipped due to empty "text" column
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
