/**
 * Psycho-social metrics computation for heatmap visualization
 * Deterministic, frontend-only helpers for classifying emotions and scoring UTAUT2 constructs
 */

import type { Document } from '../backend';
import { mockEmotionAnalysis } from './mockData';

// UTAUT2 constructs for technology acceptance analysis
export const PSYCHO_SOCIAL_DIMENSIONS = [
  'PE', // Performance Expectancy
  'EE', // Effort Expectancy
  'SI', // Social Influence
  'HM', // Hedonic Motivation
  'FC', // Facilitating Conditions
  'PV', // Price Value
  'H',  // Habit
] as const;

// Emotion categories for classification
export const EMOTION_CATEGORIES = [
  'interest',
  'trust',
  'fear',
  'skepticism',
  'satisfaction',
] as const;

export type PsychoSocialDimension = typeof PSYCHO_SOCIAL_DIMENSIONS[number];
export type EmotionCategory = typeof EMOTION_CATEGORIES[number];

/**
 * Classify document into an emotion category based on content keywords
 * Deterministic classification with no randomness
 */
export function classifyEmotionCategory(content: string): EmotionCategory {
  const lowerText = content.toLowerCase();
  
  // Priority-based classification (first match wins)
  if (lowerText.includes('bagus') || lowerText.includes('puas') || lowerText.includes('senang')) {
    return 'satisfaction';
  }
  if (lowerText.includes('percaya') || lowerText.includes('yakin') || lowerText.includes('aman')) {
    return 'trust';
  }
  if (lowerText.includes('takut') || lowerText.includes('khawatir') || lowerText.includes('bahaya')) {
    return 'fear';
  }
  if (lowerText.includes('ragu') || lowerText.includes('skeptis') || lowerText.includes('tidak yakin')) {
    return 'skepticism';
  }
  
  // Default to interest
  return 'interest';
}

/**
 * Score a single UTAUT2 construct for a document
 * Returns normalized value 0-100
 */
function scoreDimension(content: string, dimension: PsychoSocialDimension): number {
  const lowerText = content.toLowerCase();
  let score = 50; // Base score
  
  switch (dimension) {
    case 'PE': // Performance Expectancy - belief that technology improves performance/productivity
      if (lowerText.includes('efisien') || lowerText.includes('produktif')) score += 30;
      if (lowerText.includes('cepat') || lowerText.includes('hemat')) score += 25;
      if (lowerText.includes('membantu') || lowerText.includes('meningkat')) score += 20;
      if (lowerText.includes('lambat') || lowerText.includes('tidak efektif')) score -= 25;
      break;
      
    case 'EE': // Effort Expectancy - ease of use
      if (lowerText.includes('mudah') || lowerText.includes('gampang')) score += 30;
      if (lowerText.includes('sederhana') || lowerText.includes('praktis')) score += 25;
      if (lowerText.includes('intuitif') || lowerText.includes('nyaman')) score += 20;
      if (lowerText.includes('sulit') || lowerText.includes('susah')) score -= 30;
      if (lowerText.includes('rumit') || lowerText.includes('ribet')) score -= 25;
      break;
      
    case 'SI': // Social Influence - belief that important others think they should use it
      if (lowerText.includes('teman') || lowerText.includes('orang lain')) score += 25;
      if (lowerText.includes('rekomendasi') || lowerText.includes('saran')) score += 30;
      if (lowerText.includes('keluarga') || lowerText.includes('kolega')) score += 25;
      if (lowerText.includes('populer') || lowerText.includes('banyak yang')) score += 20;
      if (lowerText.includes('sendiri') || lowerText.includes('pribadi')) score -= 15;
      break;
      
    case 'HM': // Hedonic Motivation - pleasure/enjoyment from using technology
      if (lowerText.includes('senang') || lowerText.includes('suka')) score += 30;
      if (lowerText.includes('menyenangkan') || lowerText.includes('menarik')) score += 25;
      if (lowerText.includes('tertarik') || lowerText.includes('excited')) score += 25;
      if (lowerText.includes('bosan') || lowerText.includes('membosankan')) score -= 25;
      if (lowerText.includes('tidak menarik')) score -= 20;
      break;
      
    case 'FC': // Facilitating Conditions - belief that infrastructure/support is available
      if (lowerText.includes('tersedia') || lowerText.includes('ada')) score += 25;
      if (lowerText.includes('dukungan') || lowerText.includes('support')) score += 30;
      if (lowerText.includes('infrastruktur') || lowerText.includes('fasilitas')) score += 25;
      if (lowerText.includes('tidak ada') || lowerText.includes('kurang')) score -= 30;
      if (lowerText.includes('terbatas') || lowerText.includes('minim')) score -= 25;
      break;
      
    case 'PV': // Price Value - perceived benefits vs. cost
      if (lowerText.includes('murah') || lowerText.includes('terjangkau')) score += 30;
      if (lowerText.includes('hemat') || lowerText.includes('ekonomis')) score += 25;
      if (lowerText.includes('worth') || lowerText.includes('sepadan')) score += 25;
      if (lowerText.includes('mahal') || lowerText.includes('expensive')) score -= 30;
      if (lowerText.includes('tidak worth') || lowerText.includes('rugi')) score -= 25;
      break;
      
    case 'H': // Habit - automatic behavior due to learning
      if (lowerText.includes('biasa') || lowerText.includes('terbiasa')) score += 30;
      if (lowerText.includes('rutin') || lowerText.includes('sering')) score += 25;
      if (lowerText.includes('otomatis') || lowerText.includes('kebiasaan')) score += 30;
      if (lowerText.includes('jarang') || lowerText.includes('baru')) score -= 20;
      break;
  }
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute UTAUT2 construct scores for all documents
 * Returns a matrix: dimensions x emotions with normalized scores
 */
export function computePsychoSocialMatrix(documents: Document[]): number[][] {
  if (documents.length === 0) {
    return [];
  }
  
  // Initialize matrix: dimensions x emotions
  const matrix: Record<PsychoSocialDimension, Record<EmotionCategory, number[]>> = {} as any;
  
  PSYCHO_SOCIAL_DIMENSIONS.forEach(dim => {
    matrix[dim] = {} as Record<EmotionCategory, number[]>;
    EMOTION_CATEGORIES.forEach(emotion => {
      matrix[dim][emotion] = [];
    });
  });
  
  // Score each document
  documents.forEach(doc => {
    const emotion = classifyEmotionCategory(doc.content);
    
    PSYCHO_SOCIAL_DIMENSIONS.forEach(dimension => {
      const score = scoreDimension(doc.content, dimension);
      matrix[dimension][emotion].push(score);
    });
  });
  
  // Compute averages and return as 2D array
  const result: number[][] = [];
  
  PSYCHO_SOCIAL_DIMENSIONS.forEach(dimension => {
    const row: number[] = [];
    EMOTION_CATEGORIES.forEach(emotion => {
      const scores = matrix[dimension][emotion];
      const avg = scores.length > 0 
        ? scores.reduce((sum, val) => sum + val, 0) / scores.length 
        : 0;
      // Ensure valid number (no NaN)
      row.push(isNaN(avg) ? 0 : Math.round(avg));
    });
    result.push(row);
  });
  
  return result;
}

/**
 * Get color intensity for heatmap cell based on normalized score (0-100)
 */
export function getHeatmapColor(value: number): string {
  // Clamp value to 0-100
  const clamped = Math.max(0, Math.min(100, value));
  
  // Map to opacity: 0 = very light, 100 = full intensity
  const opacity = clamped / 100;
  
  // Use primary color with varying opacity
  return `oklch(var(--primary) / ${opacity})`;
}
