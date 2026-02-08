/**
 * Strategic report generation utilities
 * Deterministic helpers for building executive-ready strategic recommendations
 */

import type { Document } from '../backend';
import { mockEmotionAnalysis } from './mockData';
import { computePsychoSocialMatrix, PSYCHO_SOCIAL_DIMENSIONS, EMOTION_CATEGORIES } from './psychoSocialMetrics';
import { computeMarketingMetrics } from './marketingMetrics';

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
  brandMentions: Record<string, number>
): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = [];
  
  // Recommendation 1: Based on dominant emotion
  if (topEmotions.length > 0) {
    const topEmotion = topEmotions[0];
    
    if (topEmotion.emotion === 'fear' || topEmotion.emotion === 'skepticism') {
      recommendations.push({
        title: 'Address Consumer Concerns Through Transparency',
        rationale: `${topEmotion.percentage}% of sentiment shows ${topEmotion.emotion}, indicating significant consumer hesitation. Implement trust-building campaigns focusing on safety certifications, warranty programs, and real customer testimonials to reduce anxiety.`,
        priority: 'high',
      });
    } else if (topEmotion.emotion === 'interest' || topEmotion.emotion === 'satisfaction') {
      recommendations.push({
        title: 'Capitalize on Positive Sentiment with Conversion Campaigns',
        rationale: `${topEmotion.percentage}% of sentiment reflects ${topEmotion.emotion}, showing strong market receptivity. Launch targeted conversion campaigns with limited-time offers and test-ride programs to convert interest into purchases.`,
        priority: 'high',
      });
    } else if (topEmotion.emotion === 'trust') {
      recommendations.push({
        title: 'Leverage Trust for Brand Advocacy Programs',
        rationale: `${topEmotion.percentage}% of sentiment demonstrates trust, a valuable asset. Develop referral programs and brand ambassador initiatives to amplify positive word-of-mouth and expand market reach.`,
        priority: 'high',
      });
    }
  }
  
  // Recommendation 2: Based on weakest marketing metric
  if (marketingAnalysis.weakest) {
    const weakMetric = marketingAnalysis.weakest;
    
    if (weakMetric.metric === 'Awareness') {
      recommendations.push({
        title: 'Increase Brand Visibility Through Multi-Channel Campaigns',
        rationale: `Awareness scores at ${weakMetric.score}/100 indicate low brand recognition. Invest in digital advertising, influencer partnerships, and public events to increase top-of-mind awareness among target demographics.`,
        priority: 'high',
      });
    } else if (weakMetric.metric === 'Consideration') {
      recommendations.push({
        title: 'Strengthen Product Information and Comparison Tools',
        rationale: `Consideration scores at ${weakMetric.score}/100 suggest consumers need more information. Develop detailed comparison guides, interactive product configurators, and educational content to support decision-making.`,
        priority: 'medium',
      });
    } else if (weakMetric.metric === 'Intent') {
      recommendations.push({
        title: 'Implement Purchase Incentive Programs',
        rationale: `Intent scores at ${weakMetric.score}/100 reveal a conversion gap. Introduce financing options, trade-in programs, and early-adopter discounts to lower purchase barriers and accelerate decision-making.`,
        priority: 'high',
      });
    } else if (weakMetric.metric === 'Advocacy') {
      recommendations.push({
        title: 'Build Community and Loyalty Programs',
        rationale: `Advocacy scores at ${weakMetric.score}/100 indicate limited word-of-mouth. Create owner communities, loyalty rewards, and referral incentives to transform satisfied customers into brand advocates.`,
        priority: 'medium',
      });
    }
  }
  
  // Recommendation 3: Based on psycho-social dimensions
  if (psychoSocialDimensions.length > 0) {
    const topDimension = psychoSocialDimensions[0];
    
    if (topDimension.dimension === 'Anxiety' || topDimension.dimension === 'Risk Perception') {
      recommendations.push({
        title: 'Mitigate Risk Perception with Comprehensive Support',
        rationale: `High ${topDimension.dimension} scores (${topDimension.score}/100) indicate consumer uncertainty. Offer extended warranties, 24/7 customer support, and money-back guarantees to reduce perceived risk and build confidence.`,
        priority: 'high',
      });
    } else if (topDimension.dimension === 'Social Influence') {
      recommendations.push({
        title: 'Amplify Social Proof and Community Engagement',
        rationale: `Strong Social Influence signals (${topDimension.score}/100) show peer recommendations matter. Showcase user-generated content, customer reviews, and community events to leverage social validation.`,
        priority: 'medium',
      });
    } else if (topDimension.dimension === 'Self-Efficacy') {
      recommendations.push({
        title: 'Simplify User Experience and Onboarding',
        rationale: `Self-Efficacy scores (${topDimension.score}/100) suggest consumers value ease of use. Provide comprehensive tutorials, intuitive interfaces, and hands-on training sessions to boost user confidence.`,
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
      title: `Focus Marketing Resources on High-Engagement Brands`,
      rationale: `${topBrand} dominates conversation with ${mentions} mentions. Allocate marketing budget proportionally to high-engagement brands while investigating why others receive less attention.`,
      priority: 'medium',
    });
  }
  
  // Ensure at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Expand Data Collection for Deeper Insights',
      rationale: 'Current dataset provides limited signals. Implement systematic feedback collection across customer touchpoints to enable more granular strategic analysis and targeted interventions.',
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
  marketingAnalysis: { weakest: { metric: string; score: number } | null; strongest: { metric: string; score: number } | null }
): string[] {
  const findings: string[] = [];
  
  findings.push(`Analyzed ${documents.length} consumer sentiment documents across electric motorcycle brands.`);
  
  if (topEmotions.length > 0) {
    const top3 = topEmotions.slice(0, 3);
    findings.push(
      `Dominant emotions: ${top3.map(e => `${e.emotion} (${e.percentage}%)`).join(', ')}.`
    );
  }
  
  if (psychoSocialDimensions.length > 0) {
    const top2 = psychoSocialDimensions.slice(0, 2);
    findings.push(
      `Key psycho-social factors: ${top2.map(d => `${d.dimension} (${d.score}/100)`).join(', ')}.`
    );
  }
  
  if (marketingAnalysis.strongest && marketingAnalysis.weakest) {
    findings.push(
      `Marketing funnel: Strongest at ${marketingAnalysis.strongest.metric} (${marketingAnalysis.strongest.score}/100), weakest at ${marketingAnalysis.weakest.metric} (${marketingAnalysis.weakest.score}/100).`
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
  marketingAnalysis: { weakest: { metric: string; score: number } | null }
): string[] {
  const risks: string[] = [];
  
  // Risk based on negative emotions
  const negativeEmotions = topEmotions.filter(e => 
    e.emotion === 'fear' || e.emotion === 'skepticism'
  );
  
  if (negativeEmotions.length > 0 && negativeEmotions[0].percentage > 20) {
    risks.push(
      `High negative sentiment (${negativeEmotions[0].emotion}: ${negativeEmotions[0].percentage}%) may slow adoption rates if not addressed promptly.`
    );
  }
  
  // Risk based on psycho-social dimensions
  const highAnxiety = psychoSocialDimensions.find(d => 
    (d.dimension === 'Anxiety' || d.dimension === 'Risk Perception') && d.score > 70
  );
  
  if (highAnxiety) {
    risks.push(
      `Elevated ${highAnxiety.dimension} (${highAnxiety.score}/100) indicates consumers perceive significant barriers to adoption.`
    );
  }
  
  // Risk based on marketing gaps
  if (marketingAnalysis.weakest && marketingAnalysis.weakest.score < 50) {
    risks.push(
      `Critical gap in ${marketingAnalysis.weakest.metric} (${marketingAnalysis.weakest.score}/100) may limit market penetration and revenue growth.`
    );
  }
  
  // Default risk if none identified
  if (risks.length === 0) {
    risks.push(
      'Limited dataset size may not capture full market sentiment. Expand data collection to validate findings.'
    );
  }
  
  return risks;
}

/**
 * Generate next steps
 */
function generateNextSteps(): string[] {
  return [
    'Present findings to marketing and product teams for strategic alignment.',
    'Develop detailed action plans for each high-priority recommendation with timelines and KPIs.',
    'Establish monitoring dashboard to track sentiment changes and campaign effectiveness.',
    'Schedule quarterly reviews to reassess strategy based on updated market data.',
    'Allocate budget and resources to address identified gaps in the marketing funnel.',
  ];
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  documents: Document[],
  topEmotions: Array<{ emotion: string; count: number; percentage: number }>,
  recommendations: StrategicRecommendation[]
): string {
  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  const dominantEmotion = topEmotions.length > 0 ? topEmotions[0].emotion : 'mixed';
  
  return `Analysis of ${documents.length} consumer sentiment documents reveals ${dominantEmotion} as the dominant emotional response to electric motorcycle brands. This report identifies ${recommendations.length} strategic recommendations, including ${highPriorityCount} high-priority actions, to optimize market positioning and accelerate adoption. Key opportunities exist in addressing consumer concerns, strengthening marketing effectiveness, and leveraging positive sentiment for growth.`;
}

/**
 * Generate complete strategic report from documents
 */
export function generateStrategicReport(
  documents: Document[],
  hasPurchaseIntentionData: boolean = false
): StrategicReport {
  const generatedAt = new Date().toISOString();
  
  // If no documents, return empty report
  if (documents.length === 0) {
    return {
      generatedAt,
      executiveSummary: 'No data available for analysis. Upload documents to generate strategic recommendations.',
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
    brandMentions
  );
  
  const keyFindings = generateKeyFindings(
    documents,
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis
  );
  
  const risks = generateRisks(
    topEmotions,
    psychoSocialDimensions,
    marketingAnalysis
  );
  
  const nextSteps = generateNextSteps();
  
  const executiveSummary = generateExecutiveSummary(
    documents,
    topEmotions,
    recommendations
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
  };
}

/**
 * Convert report to Markdown format for export
 */
export function reportToMarkdown(report: StrategicReport): string {
  const lines: string[] = [];
  
  lines.push('# Strategic Recommendation Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(report.generatedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  })}`);
  lines.push('');
  
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(report.executiveSummary);
  lines.push('');
  
  if (report.keyFindings.length > 0) {
    lines.push('## Key Findings');
    lines.push('');
    report.keyFindings.forEach((finding, idx) => {
      lines.push(`${idx + 1}. ${finding}`);
    });
    lines.push('');
  }
  
  if (report.recommendations.length > 0) {
    lines.push('## Strategic Recommendations');
    lines.push('');
    report.recommendations.forEach((rec, idx) => {
      lines.push(`### ${idx + 1}. ${rec.title}`);
      lines.push('');
      lines.push(`**Priority:** ${rec.priority.toUpperCase()}`);
      lines.push('');
      lines.push(rec.rationale);
      lines.push('');
    });
  }
  
  if (report.risks.length > 0) {
    lines.push('## Risks & Watchouts');
    lines.push('');
    report.risks.forEach((risk, idx) => {
      lines.push(`${idx + 1}. ${risk}`);
    });
    lines.push('');
  }
  
  if (report.nextSteps.length > 0) {
    lines.push('## Next Steps');
    lines.push('');
    report.nextSteps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
    lines.push('');
  }
  
  lines.push('---');
  lines.push('');
  lines.push('*This report was generated using AI-powered sentiment analysis and strategic insights.*');
  
  return lines.join('\n');
}
