/**
 * Deterministic purchase intention derivation utilities
 * Derives intention_score (0-100) and intention_level (low/medium/high) from text content
 */

/**
 * Simple deterministic hash function for strings
 * Returns a stable integer for the same input
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Derive purchase intention score from text content
 * Score is deterministic and ranges from 0-100
 */
export function deriveIntentionScore(text: string): number {
  if (!text || text.trim().length === 0) {
    return 50; // Default neutral score for empty text
  }

  const normalized = text.toLowerCase().trim();
  
  // Base score from hash (0-100)
  const hash = simpleHash(normalized);
  let score = hash % 101; // 0-100 inclusive

  // Adjust based on positive keywords (increase score)
  const positiveKeywords = [
    'beli', 'buy', 'purchase', 'ingin', 'want', 'suka', 'like', 'bagus', 'good',
    'excellent', 'recommended', 'rekomendasi', 'terbaik', 'best', 'puas', 'satisfied',
    'tertarik', 'interested', 'minat', 'interest', 'akan', 'will', 'segera', 'soon'
  ];
  
  const positiveCount = positiveKeywords.filter(kw => normalized.includes(kw)).length;
  score = Math.min(100, score + (positiveCount * 5));

  // Adjust based on negative keywords (decrease score)
  const negativeKeywords = [
    'tidak', 'no', 'never', 'jangan', 'buruk', 'bad', 'jelek', 'poor',
    'mahal', 'expensive', 'takut', 'fear', 'ragu', 'doubt', 'skeptis', 'skeptical',
    'kecewa', 'disappointed', 'batal', 'cancel', 'tolak', 'reject'
  ];
  
  const negativeCount = negativeKeywords.filter(kw => normalized.includes(kw)).length;
  score = Math.max(0, score - (negativeCount * 5));

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Derive purchase intention level from score
 * Thresholds: low (0-54), medium (55-74), high (75-100)
 */
export function deriveIntentionLevel(score: number): 'low' | 'medium' | 'high' {
  const clampedScore = Math.max(0, Math.min(100, score));
  
  if (clampedScore >= 75) {
    return 'high';
  } else if (clampedScore >= 55) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Derive both score and level from text in one call
 */
export function derivePurchaseIntentionFromText(text: string): {
  intention_score: number;
  intention_level: 'low' | 'medium' | 'high';
} {
  const score = deriveIntentionScore(text);
  const level = deriveIntentionLevel(score);
  
  return {
    intention_score: score,
    intention_level: level,
  };
}

/**
 * Validate and repair provided intention score
 * Ensures score is an integer between 0-100
 */
export function validateIntentionScore(value: unknown): number {
  if (typeof value === 'number') {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return Math.max(0, Math.min(100, parsed));
    }
  }
  
  // Default to neutral score if invalid
  return 50;
}

/**
 * Validate and repair provided intention level
 * Ensures level is one of: low, medium, high
 */
export function validateIntentionLevel(value: unknown): 'low' | 'medium' | 'high' {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    
    if (normalized === 'low' || normalized === 'rendah') {
      return 'low';
    } else if (normalized === 'medium' || normalized === 'sedang') {
      return 'medium';
    } else if (normalized === 'high' || normalized === 'tinggi') {
      return 'high';
    }
  }
  
  // Default to medium if invalid
  return 'medium';
}
