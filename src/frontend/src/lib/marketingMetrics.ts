/**
 * Marketing effectiveness metrics computation for radar chart
 * Deterministic, frontend-only helpers for computing marketing funnel metrics
 */

import type { Document } from '../backend';

// Marketing effectiveness metrics (funnel stages)
export const MARKETING_METRICS = [
  'Awareness',
  'Consideration',
  'Preference',
  'Intent',
  'Advocacy',
] as const;

export type MarketingMetric = typeof MARKETING_METRICS[number];

/**
 * Compute a single marketing metric score from document text
 * Returns normalized value 0-100
 */
function computeMetricScore(content: string, metric: MarketingMetric): number {
  const lowerText = content.toLowerCase();
  let score = 40; // Base score
  
  switch (metric) {
    case 'Awareness':
      // Keywords indicating brand/product awareness
      if (lowerText.includes('tahu') || lowerText.includes('dengar')) score += 25;
      if (lowerText.includes('lihat') || lowerText.includes('kenal')) score += 20;
      if (lowerText.includes('baru') || lowerText.includes('pertama')) score += 15;
      if (lowerText.includes('gesits') || lowerText.includes('alva') || lowerText.includes('volta')) score += 10;
      break;
      
    case 'Consideration':
      // Keywords indicating active consideration
      if (lowerText.includes('pertimbang') || lowerText.includes('pikir')) score += 30;
      if (lowerText.includes('bandingkan') || lowerText.includes('cari')) score += 25;
      if (lowerText.includes('informasi') || lowerText.includes('review')) score += 20;
      if (lowerText.includes('tertarik') || lowerText.includes('menarik')) score += 15;
      break;
      
    case 'Preference':
      // Keywords indicating brand preference
      if (lowerText.includes('lebih suka') || lowerText.includes('pilih')) score += 30;
      if (lowerText.includes('terbaik') || lowerText.includes('favorit')) score += 25;
      if (lowerText.includes('unggul') || lowerText.includes('bagus')) score += 20;
      if (lowerText.includes('puas') || lowerText.includes('senang')) score += 15;
      break;
      
    case 'Intent':
      // Keywords indicating purchase intent
      if (lowerText.includes('beli') || lowerText.includes('ingin')) score += 35;
      if (lowerText.includes('akan') || lowerText.includes('rencana')) score += 30;
      if (lowerText.includes('segera') || lowerText.includes('siap')) score += 25;
      if (lowerText.includes('harga') || lowerText.includes('cicilan')) score += 15;
      break;
      
    case 'Advocacy':
      // Keywords indicating advocacy/recommendation
      if (lowerText.includes('rekomendasikan') || lowerText.includes('sarankan')) score += 35;
      if (lowerText.includes('ajak') || lowerText.includes('teman')) score += 25;
      if (lowerText.includes('bagikan') || lowerText.includes('cerita')) score += 20;
      if (lowerText.includes('puas') || lowerText.includes('percaya')) score += 15;
      break;
  }
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute all marketing metrics from documents
 * Returns array of metric objects with normalized scores (0-100)
 */
export function computeMarketingMetrics(documents: Document[]): Array<{
  metric: string;
  score: number;
}> {
  if (documents.length === 0) {
    return MARKETING_METRICS.map(metric => ({ metric, score: 0 }));
  }
  
  // Compute average score for each metric across all documents
  const metricScores: Record<MarketingMetric, number[]> = {
    Awareness: [],
    Consideration: [],
    Preference: [],
    Intent: [],
    Advocacy: [],
  };
  
  documents.forEach(doc => {
    MARKETING_METRICS.forEach(metric => {
      const score = computeMetricScore(doc.content, metric);
      metricScores[metric].push(score);
    });
  });
  
  // Calculate averages and return
  return MARKETING_METRICS.map(metric => {
    const scores = metricScores[metric];
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    // Ensure valid number (no NaN), clamp to 0-100
    const validScore = isNaN(avg) ? 0 : Math.max(0, Math.min(100, Math.round(avg)));
    
    return {
      metric,
      score: validScore,
    };
  });
}
