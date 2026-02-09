/**
 * Purchase intention aggregation utilities
 * Computes distribution, summaries, and chart-ready data from documents
 */

import type { Document } from '../backend';
import { derivePurchaseIntentionFromText } from './purchaseIntentionDerivation';

export interface IntentionDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface IntentionByBrand {
  brand: string;
  high: number;
  medium: number;
  low: number;
}

export interface IntentionTrendPoint {
  id: number;
  intentionLevel: string;
  trend: number;
}

/**
 * Compute purchase intention distribution from documents
 */
export function computeIntentionDistribution(documents: Document[]): IntentionDistribution {
  if (documents.length === 0) {
    return { high: 0, medium: 0, low: 0 };
  }

  const distribution = { high: 0, medium: 0, low: 0 };

  documents.forEach(doc => {
    const { intention_level } = derivePurchaseIntentionFromText(doc.content);
    distribution[intention_level]++;
  });

  return distribution;
}

/**
 * Compute average intention score from documents
 */
export function computeAverageIntentionScore(documents: Document[]): number {
  if (documents.length === 0) {
    return 0;
  }

  const totalScore = documents.reduce((sum, doc) => {
    const { intention_score } = derivePurchaseIntentionFromText(doc.content);
    return sum + intention_score;
  }, 0);

  return Math.round(totalScore / documents.length);
}

/**
 * Detect brand mentions in text
 */
function detectBrand(text: string): string | null {
  const brands = [
    'Gesits', 'Alva', 'Selis', 'Viar', 'Polytron', 'Yadea',
    'NIU', 'Volta', 'United', 'Davigo', 'Fox-R'
  ];

  const normalized = text.toLowerCase();
  
  for (const brand of brands) {
    if (normalized.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return null;
}

/**
 * Compute intention distribution by brand
 */
export function computeIntentionByBrand(documents: Document[]): IntentionByBrand[] {
  if (documents.length === 0) {
    return [];
  }

  const brandMap = new Map<string, IntentionDistribution>();

  documents.forEach(doc => {
    const brand = detectBrand(doc.content);
    if (!brand) return;

    const { intention_level } = derivePurchaseIntentionFromText(doc.content);

    if (!brandMap.has(brand)) {
      brandMap.set(brand, { high: 0, medium: 0, low: 0 });
    }

    const dist = brandMap.get(brand)!;
    dist[intention_level]++;
  });

  return Array.from(brandMap.entries())
    .map(([brand, dist]) => ({
      brand,
      high: dist.high,
      medium: dist.medium,
      low: dist.low,
    }))
    .sort((a, b) => {
      const totalA = a.high + a.medium + a.low;
      const totalB = b.high + b.medium + b.low;
      return totalB - totalA;
    });
}

/**
 * Compute intention trend data (mock time series based on documents)
 */
export function computeIntentionTrends(documents: Document[]): IntentionTrendPoint[] {
  if (documents.length === 0) {
    return [];
  }

  // Group documents into time buckets (simulate 6 time periods)
  const bucketSize = Math.max(1, Math.floor(documents.length / 6));
  const trends: IntentionTrendPoint[] = [];
  let trendId = 0;

  for (let i = 0; i < 6; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, documents.length);
    const bucket = documents.slice(start, end);

    if (bucket.length === 0) continue;

    // Compute average score for this bucket
    const avgScore = bucket.reduce((sum, doc) => {
      const { intention_score } = derivePurchaseIntentionFromText(doc.content);
      return sum + intention_score;
    }, 0) / bucket.length;

    // Determine dominant emotion/level
    const levelCounts = { high: 0, medium: 0, low: 0 };
    bucket.forEach(doc => {
      const { intention_level } = derivePurchaseIntentionFromText(doc.content);
      levelCounts[intention_level]++;
    });

    const dominantLevel = Object.entries(levelCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    trends.push({
      id: trendId++,
      intentionLevel: dominantLevel,
      trend: Math.round(avgScore),
    });
  }

  return trends;
}

/**
 * Compute demographic breakdowns (mock based on distribution)
 */
export interface DemographicBreakdown {
  category: string;
  high: number;
  medium: number;
  low: number;
}

export function computeGenderBreakdown(distribution: IntentionDistribution): DemographicBreakdown[] {
  return [
    {
      category: 'Pria',
      high: Math.floor(distribution.high * 0.6),
      medium: Math.floor(distribution.medium * 0.55),
      low: Math.floor(distribution.low * 0.5),
    },
    {
      category: 'Wanita',
      high: Math.floor(distribution.high * 0.4),
      medium: Math.floor(distribution.medium * 0.45),
      low: Math.floor(distribution.low * 0.5),
    },
  ];
}

export function computeLocationBreakdown(distribution: IntentionDistribution): DemographicBreakdown[] {
  return [
    {
      category: 'Jawa',
      high: Math.floor(distribution.high * 0.5),
      medium: Math.floor(distribution.medium * 0.4),
      low: Math.floor(distribution.low * 0.3),
    },
    {
      category: 'Sumatera',
      high: Math.floor(distribution.high * 0.3),
      medium: Math.floor(distribution.medium * 0.35),
      low: Math.floor(distribution.low * 0.4),
    },
    {
      category: 'Kalimantan',
      high: Math.floor(distribution.high * 0.2),
      medium: Math.floor(distribution.medium * 0.25),
      low: Math.floor(distribution.low * 0.3),
    },
  ];
}
