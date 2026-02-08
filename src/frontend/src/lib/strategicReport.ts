/**
 * Strategic report generation utilities
 * Deterministic helpers for building executive-ready strategic recommendations
 */

import type { Document } from '../backend';
import { mockEmotionAnalysis } from './mockData';
import { computePsychoSocialMatrix, PSYCHO_SOCIAL_DIMENSIONS, EMOTION_CATEGORIES } from './psychoSocialMetrics';
import { computeMarketingMetrics } from './marketingMetrics';
import { type Locale, getReportTemplates, translateEmotion } from './strategicReportLocale';

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
 * Get dominant psycho-social dimensions
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
  
  // Recommendation 3: Based on psycho-social dimensions
  if (psychoSocialDimensions.length > 0) {
    const topDimension = psychoSocialDimensions[0];
    
    if (topDimension.dimension === 'Anxiety' || topDimension.dimension === 'Risk Perception') {
      recommendations.push({
        title: templates.mitigateRisk.title,
        rationale: templates.mitigateRisk.rationale(topDimension.dimension, topDimension.score),
        priority: 'high',
      });
    } else if (topDimension.dimension === 'Social Influence') {
      recommendations.push({
        title: templates.amplifySocialProof.title,
        rationale: templates.amplifySocialProof.rationale(topDimension.score),
        priority: 'medium',
      });
    } else if (topDimension.dimension === 'Self-Efficacy') {
      recommendations.push({
        title: templates.simplifyUX.title,
        rationale: templates.simplifyUX.rationale(topDimension.score),
        priority: 'medium',
      });
    }
  }
  
  // Recommendation 4: Based on brand distribution
  const topBrands = Object.entries(brandMentions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (topBrands.length > 0) {
    const [topBrand, mentions] = topBrands[0];
    recommendations.push({
      title: templates.focusMarketing.title,
      rationale: templates.focusMarketing.rationale(topBrand, mentions),
      priority: 'medium',
    });
  }
  
  // Ensure at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push({
      title: templates.expandDataCollection.title,
      rationale: templates.expandDataCollection.rationale,
      priority: 'low',
    });
  }
  
  return recommendations.slice(0, 5); // Return top 5 recommendations
}

/**
 * Generate key findings from analysis
 */
function generateKeyFindings(
  documents: Document[],
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  psychoSocialDimensions: Array<{ dimension: string; score: number }>,
  marketingAnalysis: { weakest: { metric: string; score: number } | null; strongest: { metric: string; score: number } | null },
  locale: Locale
): string[] {
  const findings: string[] = [];
  const templates = getReportTemplates(locale);
  
  findings.push(templates.analyzedDocuments(documents.length));
  
  if (topEmotions.length > 0) {
    const top3 = topEmotions.slice(0, 3);
    findings.push(
      templates.dominantEmotions(top3.map(e => `${translateEmotion(e.emotion, locale)} (${e.percentage}%)`).join(', '))
    );
  }
  
  if (psychoSocialDimensions.length > 0) {
    const top2 = psychoSocialDimensions.slice(0, 2);
    findings.push(
      templates.psychoSocialFactors(top2.map(d => `${d.dimension} (${d.score}/100)`).join(', '))
    );
  }
  
  if (marketingAnalysis.strongest && marketingAnalysis.weakest) {
    findings.push(
      templates.marketingFunnel(
        marketingAnalysis.strongest.metric,
        marketingAnalysis.strongest.score,
        marketingAnalysis.weakest.metric,
        marketingAnalysis.weakest.score
      )
    );
  }
  
  return findings;
}

/**
 * Generate risk and watchout items
 */
function generateRisks(
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  psychoSocialDimensions: Array<{ dimension: string; score: number }>,
  marketingAnalysis: { weakest: { metric: string; score: number } | null },
  locale: Locale
): string[] {
  const risks: string[] = [];
  const templates = getReportTemplates(locale);
  
  // Risk based on negative emotions
  const negativeEmotions = topEmotions.filter(e => 
    e.emotion === 'fear' || e.emotion === 'skepticism'
  );
  
  if (negativeEmotions.length > 0 && negativeEmotions[0].percentage > 20) {
    risks.push(
      templates.highNegativeSentiment(translateEmotion(negativeEmotions[0].emotion, locale), negativeEmotions[0].percentage)
    );
  }
  
  // Risk based on psycho-social dimensions
  const highAnxiety = psychoSocialDimensions.find(d => 
    (d.dimension === 'Anxiety' || d.dimension === 'Risk Perception') && d.score > 70
  );
  
  if (highAnxiety) {
    risks.push(
      templates.elevatedAnxiety(highAnxiety.dimension, highAnxiety.score)
    );
  }
  
  // Risk based on marketing gaps
  if (marketingAnalysis.weakest && marketingAnalysis.weakest.score < 50) {
    risks.push(
      templates.criticalGap(marketingAnalysis.weakest.metric, marketingAnalysis.weakest.score)
    );
  }
  
  // Default risk if none identified
  if (risks.length === 0) {
    risks.push(templates.limitedDataset);
  }
  
  return risks;
}

/**
 * Generate next steps
 */
function generateNextSteps(locale: Locale): string[] {
  const templates = getReportTemplates(locale);
  return templates.nextSteps;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  documents: Document[],
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  recommendations: StrategicRecommendation[],
  locale: Locale
): string {
  const templates = getReportTemplates(locale);
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  const dominantEmotion = topEmotions.length > 0 ? translateEmotion(topEmotions[0].emotion, locale) : translateEmotion('mixed', locale);
  
  return templates.executiveSummaryTemplate(
    documents.length,
    dominantEmotion,
    recommendations.length,
    highPriorityCount
  );
}

/**
 * Generate complete strategic report from documents
 */
export function generateStrategicReport(
  documents: Document[],
  hasPurchaseIntentionData: boolean = false,
  locale: Locale = 'en'
): StrategicReport {
  const generatedAt = new Date().toISOString();
  const templates = getReportTemplates(locale);
  
  // If no documents, return empty report
  if (documents.length === 0) {
    return {
      generatedAt,
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
  
  // Analyze all signals
  const emotionCounts = analyzeEmotionDistribution(documents);
  const topEmotions = getTopEmotions(emotionCounts, 5);
  const brandMentions = analyzeBrandMentions(documents);
  const psychoSocialDimensions = getDominantPsychoSocialDimensions(documents);
  const marketingAnalysis = analyzeMarketingMetrics(documents);
  
  // Generate report sections
  const recommendations = generateRecommendations(
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis,
    brandMentions,
    locale
  );
  
  const keyFindings = generateKeyFindings(
    documents,
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis,
    locale
  );
  
  const risks = generateRisks(
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis,
    locale
  );
  
  const nextSteps = generateNextSteps(locale);
  
  const executiveSummary = generateExecutiveSummary(
    documents,
    topEmotions,
    recommendations,
    locale
  );
  
  return {
    generatedAt,
    executiveSummary,
    keyFindings,
    recommendations,
    risks,
    nextSteps,
    dataAvailability: {
      hasEmotionData: true,
      hasPsychoSocialData: psychoSocialDimensions.length > 0,
      hasMarketingData: marketingAnalysis.all.length > 0,
      hasPurchaseIntentionData,
    },
    locale,
  };
}

/**
 * Convert report to Markdown format for export
 */
export function reportToMarkdown(report: StrategicReport, locale?: Locale): string {
  const lines: string[] = [];
  const effectiveLocale = locale || report.locale || 'en';
  const templates = getReportTemplates(effectiveLocale);
  const uiLabels = effectiveLocale === 'id' 
    ? { 
        title: 'Laporan Rekomendasi Strategis',
        generated: 'Dibuat',
        executiveSummary: 'Ringkasan Eksekutif',
        keyFindings: 'Temuan Utama',
        recommendations: 'Rekomendasi Strategis',
        priority: 'Prioritas',
        risks: 'Risiko & Perhatian',
        nextSteps: 'Langkah Selanjutnya',
        footer: 'Laporan ini dibuat menggunakan analisis sentimen dan wawasan strategis berbasis AI.'
      }
    : {
        title: 'Strategic Recommendation Report',
        generated: 'Generated',
        executiveSummary: 'Executive Summary',
        keyFindings: 'Key Findings',
        recommendations: 'Strategic Recommendations',
        priority: 'Priority',
        risks: 'Risks & Watchouts',
        nextSteps: 'Next Steps',
        footer: 'This report was generated using AI-powered sentiment analysis and strategic insights.'
      };
  
  lines.push(`# ${uiLabels.title}`);
  lines.push('');
  lines.push(`**${uiLabels.generated}:** ${new Date(report.generatedAt).toLocaleString(effectiveLocale === 'id' ? 'id-ID' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  })}`);
  lines.push('');
  
  lines.push(`## ${uiLabels.executiveSummary}`);
  lines.push('');
  lines.push(report.executiveSummary);
  lines.push('');
  
  if (report.keyFindings.length > 0) {
    lines.push(`## ${uiLabels.keyFindings}`);
    lines.push('');
    report.keyFindings.forEach((finding, idx) => {
      lines.push(`${idx + 1}. ${finding}`);
    });
    lines.push('');
  }
  
  if (report.recommendations.length > 0) {
    lines.push(`## ${uiLabels.recommendations}`);
    lines.push('');
    report.recommendations.forEach((rec, idx) => {
      lines.push(`### ${idx + 1}. ${rec.title}`);
      lines.push('');
      const priorityLabel = effectiveLocale === 'id' 
        ? (rec.priority === 'high' ? 'TINGGI' : rec.priority === 'medium' ? 'SEDANG' : 'RENDAH')
        : rec.priority.toUpperCase();
      lines.push(`**${uiLabels.priority}:** ${priorityLabel}`);
      lines.push('');
      lines.push(rec.rationale);
      lines.push('');
    });
  }
  
  if (report.risks.length > 0) {
    lines.push(`## ${uiLabels.risks}`);
    lines.push('');
    report.risks.forEach((risk, idx) => {
      lines.push(`${idx + 1}. ${risk}`);
    });
    lines.push('');
  }
  
  if (report.nextSteps.length > 0) {
    lines.push(`## ${uiLabels.nextSteps}`);
    lines.push('');
    report.nextSteps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push(`*${uiLabels.footer}*`);
  
  return lines.join('\n');
}
