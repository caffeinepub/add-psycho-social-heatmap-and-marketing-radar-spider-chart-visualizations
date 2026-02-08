import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Printer, AlertTriangle, CheckCircle2, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { useGetAllDocuments } from '../hooks/useQueries';
import { generateStrategicReport, reportToMarkdown } from '../lib/strategicReport';
import { toast } from 'sonner';
import { useMemo } from 'react';

export function StrategicRecommendationReportPage() {
  const { data: documents = [], isLoading } = useGetAllDocuments();

  // Generate report from current documents
  const report = useMemo(() => {
    return generateStrategicReport(documents, false);
  }, [documents]);

  const handleCopyMarkdown = async () => {
    try {
      const markdown = reportToMarkdown(report);
      await navigator.clipboard.writeText(markdown);
      toast.success('Report copied to clipboard as Markdown');
    } catch (error) {
      toast.error('Failed to copy report to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Strategic Recommendation Report</h1>
          <p className="text-muted-foreground">
            Executive-ready insights and actionable recommendations for decision-makers
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No Data Available</h3>
            <p className="mb-6 text-center text-muted-foreground">
              There is no data to generate a strategic report. Please upload documents to the system first.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityColors = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary',
  } as const;

  return (
    <div className="container py-8">
      {/* Header - hidden in print */}
      <div className="mb-8 print:hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Strategic Recommendation Report</h1>
            <p className="text-muted-foreground">
              Executive-ready insights and actionable recommendations for decision-makers
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyMarkdown}>
              <Download className="mr-2 h-4 w-4" />
              Copy as Markdown
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div className="report-container space-y-6">
        {/* Metadata */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Report Metadata
                </CardTitle>
                <CardDescription>
                  Generated on {new Date(report.generatedAt).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {documents.length} Documents Analyzed
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">{report.executiveSummary}</p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        {report.keyFindings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{finding}</span>
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
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
              <CardDescription>
                Actionable recommendations prioritized by impact and urgency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.recommendations.map((rec, idx) => (
                <div key={idx}>
                  {idx > 0 && <Separator className="my-6" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold">
                        {idx + 1}. {rec.title}
                      </h3>
                      <Badge variant={priorityColors[rec.priority]}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="leading-relaxed text-muted-foreground">{rec.rationale}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Risks & Watchouts */}
        {report.risks.length > 0 && (
          <Card className="border-orange-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Risks & Watchouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                    <span className="leading-relaxed">{risk}</span>
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
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {report.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Data Availability Notice */}
        {!report.dataAvailability.hasPurchaseIntentionData && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div className="text-sm">
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  Note: Purchase Intention Data Not Available
                </p>
                <p className="text-muted-foreground">
                  This report is based on emotion and sentiment analysis. Purchase intention metrics are not included in the current analysis. For more comprehensive insights, consider enabling purchase intention tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
