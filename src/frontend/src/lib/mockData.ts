// List of popular Indonesian electric motorcycle brands
export const INDONESIAN_EV_BRANDS = [
  'Gesits',
  'Alva',
  'Selis',
  'Viar Q1',
  'Viar',
  'Polytron Fox-R',
  'Polytron',
  'Fox-R',
  'Yadea',
  'NIU',
  'Volta',
  'United T1800',
  'United',
  'Davigo',
];

// Detect brand in text
export function detectBrand(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Check for each brand (case-insensitive)
  for (const brand of INDONESIAN_EV_BRANDS) {
    if (lowerText.includes(brand.toLowerCase())) {
      // Return the canonical brand name (without model suffix)
      if (brand === 'Viar Q1') return 'Viar';
      if (brand === 'Polytron Fox-R' || brand === 'Fox-R') return 'Polytron';
      if (brand === 'United T1800') return 'United';
      return brand;
    }
  }
  
  return null;
}

// Mock emotion analysis function to simulate BERT ensemble predictions
export function mockEmotionAnalysis(text: string) {
  const emotions = ['minat', 'kepercayaan', 'ketakutan', 'skeptisisme', 'kepuasan'];
  const ensembles = ['JC', 'JA', 'JD'];
  
  // Detect brand in text
  const detectedBrand = detectBrand(text);
  
  // Simple heuristic based on text content
  let primaryEmotion = 'minat';
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('bagus') || lowerText.includes('puas') || lowerText.includes('senang')) {
    primaryEmotion = 'kepuasan';
  } else if (lowerText.includes('percaya') || lowerText.includes('yakin') || lowerText.includes('aman')) {
    primaryEmotion = 'kepercayaan';
  } else if (lowerText.includes('takut') || lowerText.includes('khawatir') || lowerText.includes('bahaya')) {
    primaryEmotion = 'ketakutan';
  } else if (lowerText.includes('ragu') || lowerText.includes('skeptis') || lowerText.includes('tidak yakin')) {
    primaryEmotion = 'skeptisisme';
  } else if (lowerText.includes('tertarik') || lowerText.includes('ingin') || lowerText.includes('menarik')) {
    primaryEmotion = 'minat';
  }
  
  // Generate mock emotion scores
  const emotionScores: Record<string, number> = {};
  emotions.forEach((emotion) => {
    if (emotion === primaryEmotion) {
      emotionScores[emotion] = 0.7 + Math.random() * 0.25;
    } else {
      emotionScores[emotion] = Math.random() * 0.3;
    }
  });
  
  return {
    primaryEmotion,
    confidence: emotionScores[primaryEmotion],
    emotions: emotionScores,
    ensemble: ensembles[Math.floor(Math.random() * ensembles.length)],
    brand: detectedBrand,
  };
}
