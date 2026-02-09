/**
 * Strategic report generation utilities
 * Deterministic helpers for building executive-ready strategic recommendations
 */

import type { Document } from '../backend';
import { mockEmotionAnalysis } from './mockData';
import { computePsychoSocialMatrix, PSYCHO_SOCIAL_DIMENSIONS, EMOTION_CATEGORIES } from './psychoSocialMetrics';
import { computeMarketingMetrics } from './marketingMetrics';
import { type Locale, getReportTemplates, translateEmotion, getUILabels, getPriorityLabel } from './strategicReportLocale';

export interface StrategicRecommendation {
  title: string;
  rationale: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StrategicReport {
  generatedAt: string;
  executiveSummary: string;
  keyFindings: string[];
  recommendations: StrategicRecommendation[];
  risks: string[];
  nextSteps: string[];
  dataAvailability: {
    hasEmotionData: boolean;
    hasPsychoSocialData: boolean;
    hasMarketingData: boolean;
    hasPurchaseIntentionData: boolean;
  };
  locale: Locale;
}

/**
 * Analyze emotion distribution from documents
 */
function analyzeEmotionDistribution(documents: Document[]): Record<string, number> {
  const emotionCounts: Record<string, number> = {};
  
  documents.forEach(doc => {
    const analysis = mockEmotionAnalysis(doc.content);
    const emotion = analysis.primaryEmotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  return emotionCounts;
}

/**
 * Get top N emotions by frequency
 */
function getTopEmotions(emotionCounts: Record<string, number>, n: number): Array<{ emotion: string; count: number; percentage: number }> {
  const total = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

/**
 * Analyze brand mentions from documents
 */
function analyzeBrandMentions(documents: Document[]): Record<string, number> {
  const brandCounts: Record<string, number> = {};
  
  documents.forEach(doc => {
    const analysis = mockEmotionAnalysis(doc.content);
    if (analysis.brand) {
      brandCounts[analysis.brand] = (brandCounts[analysis.brand] || 0) + 1;
    }
  });
  
  return brandCounts;
}

/**
 * Get dominant UTAUT2 constructs
 */
function getDominantPsychoSocialDimensions(documents: Document[]): Array<{ dimension: string; score: number }> {
  const matrix = computePsychoSocialMatrix(documents);
  
  if (matrix.length === 0) {
    return [];
  }
  
  // Calculate average score for each dimension across all emotions
  const dimensionScores = matrix.map((row, idx) => {
    const avg = row.reduce((sum, val) => sum + val, 0) / row.length;
    return {
      dimension: PSYCHO_SOCIAL_DIMENSIONS[idx],
      score: Math.round(avg),
    };
  });
  
  return dimensionScores.sort((a, b) => b.score - a.score);
}

/**
 * Get weakest and strongest marketing metrics
 */
function analyzeMarketingMetrics(documents: Document[]): {
  weakest: { metric: string; score: number } | null;
  strongest: { metric: string; score: number } | null;
  all: Array<{ metric: string; score: number }>;
} {
  const metrics = computeMarketingMetrics(documents);
  
  if (metrics.length === 0) {
    return { weakest: null, strongest: null, all: [] };
  }
  
  const sorted = [...metrics].sort((a, b) => a.score - b.score);
  
  return {
    weakest: sorted[0],
    strongest: sorted[sorted.length - 1],
    all: metrics,
  };
}

/**
 * Generate strategic recommendations based on analysis signals
 */
function generateRecommendations(
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  psychoSocialDimensions: Array<{ dimension: string; score: number }>,
  marketingAnalysis: { weakest: { metric: string; score: number } | null; strongest: { metric: string; score: number } | null },
  brandMentions: Record<string, number>,
  documentCount: number,
  locale: Locale
): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = [];
  const templates = getReportTemplates(locale);
  
  // Recommendation 1: Based on dominant emotion
  if (topEmotions.length > 0) {
    const topEmotion = topEmotions[0];
    
    if (topEmotion.emotion === 'fear' || topEmotion.emotion === 'skepticism') {
      recommendations.push({
        title: templates.addressConcerns.title,
        rationale: templates.addressConcerns.rationale(topEmotion.percentage, translateEmotion(topEmotion.emotion, locale)),
        priority: 'high',
      });
    } else if (topEmotion.emotion === 'interest' || topEmotion.emotion === 'satisfaction') {
      recommendations.push({
        title: templates.capitalizePositive.title,
        rationale: templates.capitalizePositive.rationale(topEmotion.percentage, translateEmotion(topEmotion.emotion, locale)),
        priority: 'high',
      });
    } else if (topEmotion.emotion === 'trust') {
      recommendations.push({
        title: templates.leverageTrust.title,
        rationale: templates.leverageTrust.rationale(topEmotion.percentage),
        priority: 'high',
      });
    }
  }
  
  // Recommendation 2: Based on weakest marketing metric
  if (marketingAnalysis.weakest) {
    const weakMetric = marketingAnalysis.weakest;
    
    if (weakMetric.metric === 'Awareness') {
      recommendations.push({
        title: templates.increaseBrandVisibility.title,
        rationale: templates.increaseBrandVisibility.rationale(weakMetric.score),
        priority: 'high',
      });
    } else if (weakMetric.metric === 'Consideration') {
      recommendations.push({
        title: templates.strengthenProductInfo.title,
        rationale: templates.strengthenProductInfo.rationale(weakMetric.score),
        priority: 'medium',
      });
    } else if (weakMetric.metric === 'Intent') {
      recommendations.push({
        title: templates.implementIncentives.title,
        rationale: templates.implementIncentives.rationale(weakMetric.score),
        priority: 'high',
      });
    } else if (weakMetric.metric === 'Advocacy') {
      recommendations.push({
        title: templates.buildCommunity.title,
        rationale: templates.buildCommunity.rationale(weakMetric.score),
        priority: 'medium',
      });
    }
  }
  
  // Recommendation 3: Based on UTAUT2 constructs
  if (psychoSocialDimensions.length > 0) {
    const topDimension = psychoSocialDimensions[0];
    
    // Low EE (Effort Expectancy) - ease of use concerns
    if (topDimension.dimension === 'EE' && topDimension.score < 60) {
      recommendations.push({
        title: templates.simplifyUX.title,
        rationale: templates.simplifyUX.rationale(topDimension.score),
        priority: 'high',
      });
    }
    
    // High SI (Social Influence) - leverage peer recommendations
    if (topDimension.dimension === 'SI' && topDimension.score >= 70) {
      recommendations.push({
        title: templates.amplifySocialProof.title,
        rationale: templates.amplifySocialProof.rationale(topDimension.score),
        priority: 'medium',
      });
    }
    
    // Low PV (Price Value) - address cost concerns
    if (topDimension.dimension === 'PV' && topDimension.score < 60) {
      recommendations.push({
        title: templates.addressPriceValue.title,
        rationale: templates.addressPriceValue.rationale(topDimension.score),
        priority: 'high',
      });
    }
    
    // Low FC (Facilitating Conditions) - infrastructure concerns
    if (topDimension.dimension === 'FC' && topDimension.score < 60) {
      recommendations.push({
        title: templates.improveFacilitating.title,
        rationale: templates.improveFacilitating.rationale(topDimension.score),
        priority: 'high',
      });
    }
    
    // Low HM (Hedonic Motivation) - enjoyment concerns
    if (topDimension.dimension === 'HM' && topDimension.score < 60) {
      recommendations.push({
        title: templates.enhanceExperience.title,
        rationale: templates.enhanceExperience.rationale(topDimension.score),
        priority: 'medium',
      });
    }
  }
  
  // Recommendation 4: Based on brand mentions
  const brandEntries = Object.entries(brandMentions).sort((a, b) => b[1] - a[1]);
  if (brandEntries.length > 0) {
    const topBrand = brandEntries[0];
    recommendations.push({
      title: templates.focusMarketing.title,
      rationale: templates.focusMarketing.rationale(topBrand[0], topBrand[1]),
      priority: 'medium',
    });
  }
  
  // Recommendation 5: Data collection (always relevant)
  if (documentCount < 50) {
    recommendations.push({
      title: templates.expandDataCollection.title,
      rationale: templates.expandDataCollection.rationale,
      priority: 'low',
    });
  }
  
  return recommendations;
}

/**
 * Generate risk items based on analysis signals
 */
function generateRisks(
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  psychoSocialDimensions: Array<{ dimension: string; score: number }>,
  marketingAnalysis: { weakest: { metric: string; score: number } | null },
  documents: Document[],
  locale: Locale
): string[] {
  const risks: string[] = [];
  const templates = getReportTemplates(locale);
  
  // Risk 1: High negative sentiment
  if (topEmotions.length > 0) {
    const topEmotion = topEmotions[0];
    if ((topEmotion.emotion === 'fear' || topEmotion.emotion === 'skepticism') && topEmotion.percentage > 30) {
      risks.push(templates.highNegativeSentiment(translateEmotion(topEmotion.emotion, locale), topEmotion.percentage));
    }
  }
  
  // Risk 2: Low UTAUT2 construct scores
  psychoSocialDimensions.forEach(dim => {
    if (dim.score < 50) {
      risks.push(templates.lowUTAUT2Score(dim.dimension, dim.score));
    }
  });
  
  // Risk 3: Critical marketing funnel gap
  if (marketingAnalysis.weakest && marketingAnalysis.weakest.score < 40) {
    risks.push(templates.criticalGap(marketingAnalysis.weakest.metric, marketingAnalysis.weakest.score));
  }
  
  // Risk 4: Limited dataset
  if (documents.length < 20) {
    risks.push(templates.limitedDataset);
  }
  
  return risks;
}

/**
 * Generate strategic report from documents
 */
export function generateStrategicReport(documents: Document[], locale: Locale = 'en'): StrategicReport {
  const templates = getReportTemplates(locale);
  
  if (documents.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      executiveSummary: templates.noDataSummary,
      keyFindings: [],
      recommendations: [],
      risks: [],
      nextSteps: [],
      dataAvailability: {
        hasEmotionData: false,
        hasPsychoSocialData: false,
        hasMarketingData: false,
        hasPurchaseIntentionData: false,
      },
      locale,
    };
  }

  // Analyze data
  const emotionCounts = analyzeEmotionDistribution(documents);
  const topEmotions = getTopEmotions(emotionCounts, 3);
  const brandMentions = analyzeBrandMentions(documents);
  const psychoSocialDimensions = getDominantPsychoSocialDimensions(documents);
  const marketingAnalysis = analyzeMarketingMetrics(documents);

  // Generate recommendations
  const recommendations = generateRecommendations(
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis,
    brandMentions,
    documents.length,
    locale
  );

  // Count high-priority recommendations
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;

  // Generate executive summary
  const executiveSummary = templates.executiveSummaryTemplate(
    documents.length,
    topEmotions.length > 0 ? translateEmotion(topEmotions[0].emotion, locale) : 'N/A',
    recommendations.length,
    highPriorityCount
  );

  // Generate key findings
  const keyFindings: string[] = [];
  
  keyFindings.push(templates.analyzedDocuments(documents.length));

  if (topEmotions.length > 0) {
    const emotionList = topEmotions
      .map(e => `${translateEmotion(e.emotion, locale)} (${e.percentage}%)`)
      .join(', ');
    keyFindings.push(templates.dominantEmotions(emotionList));
  }

  if (psychoSocialDimensions.length > 0) {
    const topDims = psychoSocialDimensions.slice(0, 3);
    const dimList = topDims.map(d => `${d.dimension} (${d.score}%)`).join(', ');
    keyFindings.push(templates.psychoSocialFactors(dimList));
  }

  if (marketingAnalysis.strongest && marketingAnalysis.weakest) {
    keyFindings.push(
      templates.marketingFunnel(
        marketingAnalysis.strongest.metric,
        marketingAnalysis.strongest.score,
        marketingAnalysis.weakest.metric,
        marketingAnalysis.weakest.score
      )
    );
  }

  // Generate risks
  const risks = generateRisks(
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis,
    documents,
    locale
  );

  // Get next steps from templates
  const nextSteps = templates.nextSteps;

  return {
    generatedAt: new Date().toISOString(),
    executiveSummary,
    keyFindings,
    recommendations,
    risks,
    nextSteps,
    dataAvailability: {
      hasEmotionData: documents.length > 0,
      hasPsychoSocialData: documents.length > 0,
      hasMarketingData: documents.length > 0,
      hasPurchaseIntentionData: documents.length > 0, // Now always true when documents exist
    },
    locale,
  };
}

/**
 * Export report as Markdown
 */
export function exportReportAsMarkdown(report: StrategicReport): string {
  const uiLabels = getUILabels(report.locale);
  
  let markdown = `# ${uiLabels.pageTitle}\n\n`;
  markdown += `${uiLabels.generatedOn}: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## ${uiLabels.executiveSummary}\n\n`;
  markdown += `${report.executiveSummary}\n\n`;
  
  if (report.keyFindings.length > 0) {
    markdown += `## ${uiLabels.keyFindings}\n\n`;
    report.keyFindings.forEach((finding, idx) => {
      markdown += `${idx + 1}. ${finding}\n`;
    });
    markdown += `\n`;
  }
  
  if (report.recommendations.length > 0) {
    markdown += `## ${uiLabels.strategicRecommendations}\n\n`;
    report.recommendations.forEach((rec, idx) => {
      markdown += `### ${idx + 1}. ${rec.title}\n\n`;
      markdown += `**Priority**: ${getPriorityLabel(rec.priority, report.locale)}\n\n`;
      markdown += `${rec.rationale}\n\n`;
    });
  }
  
  if (report.risks.length > 0) {
    markdown += `## ${uiLabels.risksWatchouts}\n\n`;
    report.risks.forEach((risk, idx) => {
      markdown += `${idx + 1}. ${risk}\n`;
    });
    markdown += `\n`;
  }
  
  if (report.nextSteps.length > 0) {
    markdown += `## ${uiLabels.nextSteps}\n\n`;
    report.nextSteps.forEach((step, idx) => {
      markdown += `${idx + 1}. ${step}\n`;
    });
    markdown += `\n`;
  }
  
  return markdown;
}
