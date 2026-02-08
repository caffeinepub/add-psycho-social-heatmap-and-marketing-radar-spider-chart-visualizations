/**
 * Marketing Mix (8P) metrics computation for radar chart
 * Deterministic, frontend-only helpers for computing 8 Marketing Mix factor scores
 */

import type { Document } from '../backend';

// Marketing Mix 8 factors with codes and full English names
export const MARKETING_MIX_FACTORS = [
  { code: 'PROD', name: 'Innovative Product Strategy' },
  { code: 'PRICE', name: 'Innovative Pricing Architecture' },
  { code: 'DIST', name: 'Innovative Distribution Network' },
  { code: 'COMM', name: 'Innovative Communication Strategy' },
  { code: 'HRD', name: 'Innovative Human Resource Development' },
  { code: 'CUSJ', name: 'Innovative Customer Journey Design' },
  { code: 'BRAND', name: 'Innovative Brand Experience Creation' },
  { code: 'COLLAB', name: 'Collaboration Ecosystem Strategy' },
] as const;

export type MarketingMixFactorCode = typeof MARKETING_MIX_FACTORS[number]['code'];

/**
 * Compute a single Marketing Mix factor score from document text
 * Returns normalized value 0-100
 */
function computeFactorScore(content: string, factorCode: MarketingMixFactorCode): number {
  const lowerText = content.toLowerCase();
  let score = 35; // Base score
  
  switch (factorCode) {
    case 'PROD':
      // Product innovation keywords
      if (lowerText.includes('inovasi') || lowerText.includes('innovation')) score += 25;
      if (lowerText.includes('fitur') || lowerText.includes('feature')) score += 20;
      if (lowerText.includes('teknologi') || lowerText.includes('technology')) score += 20;
      if (lowerText.includes('kualitas') || lowerText.includes('quality')) score += 15;
      if (lowerText.includes('desain') || lowerText.includes('design')) score += 10;
      break;
      
    case 'PRICE':
      // Pricing strategy keywords
      if (lowerText.includes('harga') || lowerText.includes('price')) score += 30;
      if (lowerText.includes('terjangkau') || lowerText.includes('affordable')) score += 25;
      if (lowerText.includes('murah') || lowerText.includes('cheap')) score += 20;
      if (lowerText.includes('mahal') || lowerText.includes('expensive')) score += 15;
      if (lowerText.includes('cicilan') || lowerText.includes('installment')) score += 15;
      break;
      
    case 'DIST':
      // Distribution network keywords
      if (lowerText.includes('dealer') || lowerText.includes('distributor')) score += 30;
      if (lowerText.includes('toko') || lowerText.includes('store')) score += 25;
      if (lowerText.includes('online') || lowerText.includes('e-commerce')) score += 20;
      if (lowerText.includes('tersedia') || lowerText.includes('available')) score += 15;
      if (lowerText.includes('akses') || lowerText.includes('access')) score += 10;
      break;
      
    case 'COMM':
      // Communication strategy keywords
      if (lowerText.includes('promosi') || lowerText.includes('promotion')) score += 30;
      if (lowerText.includes('iklan') || lowerText.includes('advertisement')) score += 25;
      if (lowerText.includes('media sosial') || lowerText.includes('social media')) score += 20;
      if (lowerText.includes('kampanye') || lowerText.includes('campaign')) score += 15;
      if (lowerText.includes('informasi') || lowerText.includes('information')) score += 10;
      break;
      
    case 'HRD':
      // Human resource development keywords
      if (lowerText.includes('layanan') || lowerText.includes('service')) score += 30;
      if (lowerText.includes('customer service') || lowerText.includes('cs')) score += 25;
      if (lowerText.includes('ramah') || lowerText.includes('friendly')) score += 20;
      if (lowerText.includes('profesional') || lowerText.includes('professional')) score += 15;
      if (lowerText.includes('bantuan') || lowerText.includes('help')) score += 10;
      break;
      
    case 'CUSJ':
      // Customer journey design keywords
      if (lowerText.includes('pengalaman') || lowerText.includes('experience')) score += 30;
      if (lowerText.includes('mudah') || lowerText.includes('easy')) score += 25;
      if (lowerText.includes('nyaman') || lowerText.includes('comfortable')) score += 20;
      if (lowerText.includes('proses') || lowerText.includes('process')) score += 15;
      if (lowerText.includes('cepat') || lowerText.includes('fast')) score += 10;
      break;
      
    case 'BRAND':
      // Brand experience keywords
      if (lowerText.includes('brand') || lowerText.includes('merek')) score += 30;
      if (lowerText.includes('reputasi') || lowerText.includes('reputation')) score += 25;
      if (lowerText.includes('percaya') || lowerText.includes('trust')) score += 20;
      if (lowerText.includes('terkenal') || lowerText.includes('famous')) score += 15;
      if (lowerText.includes('gesits') || lowerText.includes('alva') || lowerText.includes('volta')) score += 10;
      break;
      
    case 'COLLAB':
      // Collaboration ecosystem keywords
      if (lowerText.includes('kolaborasi') || lowerText.includes('collaboration')) score += 30;
      if (lowerText.includes('kemitraan') || lowerText.includes('partnership')) score += 25;
      if (lowerText.includes('ekosistem') || lowerText.includes('ecosystem')) score += 20;
      if (lowerText.includes('komunitas') || lowerText.includes('community')) score += 15;
      if (lowerText.includes('jaringan') || lowerText.includes('network')) score += 10;
      break;
  }
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Compute all Marketing Mix factor scores from documents
 * Returns array of 8 factor scores in exact order: PROD, PRICE, DIST, COMM, HRD, CUSJ, BRAND, COLLAB
 * Each score is normalized 0-100, deterministic, and finite
 */
export function computeMarketingMixScores(documents: Document[]): number[] {
  if (documents.length === 0) {
    return MARKETING_MIX_FACTORS.map(() => 0);
  }
  
  // Compute average score for each factor across all documents
  const factorScores: Record<MarketingMixFactorCode, number[]> = {
    PROD: [],
    PRICE: [],
    DIST: [],
    COMM: [],
    HRD: [],
    CUSJ: [],
    BRAND: [],
    COLLAB: [],
  };
  
  documents.forEach(doc => {
    MARKETING_MIX_FACTORS.forEach(factor => {
      const score = computeFactorScore(doc.content, factor.code);
      factorScores[factor.code].push(score);
    });
  });
  
  // Calculate averages and return in exact order
  return MARKETING_MIX_FACTORS.map(factor => {
    const scores = factorScores[factor.code];
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    // Ensure valid number (no NaN), clamp to 0-100
    const validScore = isNaN(avg) ? 0 : Math.max(0, Math.min(100, Math.round(avg)));
    
    return validScore;
  });
}
