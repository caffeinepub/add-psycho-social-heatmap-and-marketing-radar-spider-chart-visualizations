import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Copy, Printer, Download, AlertCircle } from 'lucide-react';
import { useGetAllDocuments } from '../hooks/useQueries';
import { useMemo, useState } from 'react';
import { generateStrategicReport, exportReportAsMarkdown } from '../lib/strategicReport';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { exportReportAsPdf } from '../lib/reportPdfExport';
import { getUILabels, getPriorityLabel, type Locale } from '../lib/strategicReportLocale';

export function StrategicRecommendationReportPage() {
  const { data: documents = [], isLoading } = useGetAllDocuments();
  const navigate = useNavigate();
  const [locale, setLocale] = useState<Locale>('en');

  const report = useMemo(() => {
    return generateStrategicReport(documents, locale);
  }, [documents, locale]);

  const uiLabels = getUILabels(locale);

  const handleCopyMarkdown = () => {
    const markdown = exportReportAsMarkdown(report);
    navigator.clipboard.writeText(markdown);
    toast.success(locale === 'en' ? 'Report copied as Markdown' : 'Laporan disalin sebagai Markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportReportAsPdf({ locale });
  };

  const toggleLocale = () => {
    setLocale(prev => prev === 'en' ? 'id' : 'en');
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              {uiLabels.noDataTitle}
            </CardTitle>
            <CardDescription>{uiLabels.noDataDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })}>{uiLabels.goToDashboard}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{uiLabels.pageTitle}</h1>
          <p className="text-muted-foreground">{uiLabels.pageDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={toggleLocale}>
            {uiLabels.languageLabel}: {locale === 'en' ? 'EN' : 'ID'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
            <Copy className="mr-2 h-4 w-4" />
            {uiLabels.copyMarkdown}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {uiLabels.print}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            {uiLabels.downloadPdf}
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-8">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {uiLabels.reportMetadata}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{uiLabels.generatedOn}:</span>
              <span className="text-sm font-medium">
                {new Date(report.generatedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{uiLabels.documentsAnalyzed}:</span>
              <span className="text-sm font-medium">{documents.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{uiLabels.executiveSummary}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">{report.executiveSummary}</p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        {report.keyFindings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{uiLabels.keyFindings}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-semibold text-primary">{idx + 1}.</span>
                    <span className="flex-1 leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Strategic Recommendations */}
        {report.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{uiLabels.strategicRecommendations}</CardTitle>
              <CardDescription>{uiLabels.recommendationsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold">
                      {idx + 1}. {rec.title}
                    </h3>
                    <Badge
                      variant={
                        rec.priority === 'high'
                          ? 'destructive'
                          : rec.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {getPriorityLabel(rec.priority, locale)}
                    </Badge>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{rec.rationale}</p>
                  {idx < report.recommendations.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Risks & Watchouts */}
        {report.risks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{uiLabels.risksWatchouts}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-semibold text-destructive">{idx + 1}.</span>
                    <span className="flex-1 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {report.nextSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{uiLabels.nextSteps}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-semibold text-primary">{idx + 1}.</span>
                    <span className="flex-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Purchase Intention Notice (only show if data is not available) */}
        {!report.dataAvailability.hasPurchaseIntentionData && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <AlertCircle className="h-5 w-5" />
                {uiLabels.purchaseIntentionNotice}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                {uiLabels.purchaseIntentionNoticeDescription}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
