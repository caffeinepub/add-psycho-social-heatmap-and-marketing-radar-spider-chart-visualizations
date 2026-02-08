/**
 * Psycho-social metrics computation for heatmap visualization
 * Deterministic, frontend-only helpers for classifying emotions and scoring psycho-social dimensions
 */

import type { Document } from '../backend';
import { mockEmotionAnalysis } from './mockData';

// Psycho-social dimensions to analyze
export const PSYCHO_SOCIAL_DIMENSIONS = [
  'Trust',
  'Anxiety',
  'Excitement',
  'Social Influence',
  'Self-Efficacy',
  'Risk Perception',
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
 * Score a single psycho-social dimension for a document
 * Returns normalized value 0-100
 */
function scoreDimension(content: string, dimension: PsychoSocialDimension): number {
  const lowerText = content.toLowerCase();
  let score = 50; // Base score
  
  switch (dimension) {
    case 'Trust':
      if (lowerText.includes('percaya') || lowerText.includes('yakin')) score += 30;
      if (lowerText.includes('aman') || lowerText.includes('terpercaya')) score += 20;
      if (lowerText.includes('ragu') || lowerText.includes('skeptis')) score -= 25;
      break;
      
    case 'Anxiety':
      if (lowerText.includes('takut') || lowerText.includes('khawatir')) score += 35;
      if (lowerText.includes('bahaya') || lowerText.includes('risiko')) score += 25;
      if (lowerText.includes('tenang') || lowerText.includes('aman')) score -= 30;
      break;
      
    case 'Excitement':
      if (lowerText.includes('tertarik') || lowerText.includes('menarik')) score += 30;
      if (lowerText.includes('senang') || lowerText.includes('suka')) score += 25;
      if (lowerText.includes('bosan') || lowerText.includes('biasa')) score -= 20;
      break;
      
    case 'Social Influence':
      if (lowerText.includes('teman') || lowerText.includes('orang lain')) score += 25;
      if (lowerText.includes('rekomendasi') || lowerText.includes('saran')) score += 30;
      if (lowerText.includes('sendiri') || lowerText.includes('pribadi')) score -= 15;
      break;
      
    case 'Self-Efficacy':
      if (lowerText.includes('bisa') || lowerText.includes('mampu')) score += 30;
      if (lowerText.includes('mudah') || lowerText.includes('gampang')) score += 25;
      if (lowerText.includes('sulit') || lowerText.includes('susah')) score -= 30;
      break;
      
    case 'Risk Perception':
      if (lowerText.includes('risiko') || lowerText.includes('bahaya')) score += 35;
      if (lowerText.includes('takut') || lowerText.includes('khawatir')) score += 25;
      if (lowerText.includes('aman') || lowerText.includes('terjamin')) score -= 30;
      break;
  }
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute psycho-social scores for all documents
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
