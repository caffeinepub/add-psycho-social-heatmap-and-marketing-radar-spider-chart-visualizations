/**
 * Strategic Report Localization
 * Centralized bilingual (EN/ID) labels for the Strategic Recommendation Report
 */

export type Locale = 'en' | 'id';

interface UILabels {
  pageTitle: string;
  pageDescription: string;
  copyMarkdown: string;
  print: string;
  reportMetadata: string;
  generatedOn: string;
  documentsAnalyzed: string;
  executiveSummary: string;
  keyFindings: string;
  strategicRecommendations: string;
  recommendationsDescription: string;
  risksWatchouts: string;
  nextSteps: string;
  noDataTitle: string;
  noDataDescription: string;
  goToDashboard: string;
  purchaseIntentionNotice: string;
  purchaseIntentionNoticeDescription: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  languageLabel: string;
}

const EN_LABELS: UILabels = {
  pageTitle: 'Strategic Recommendation Report',
  pageDescription: 'Executive-ready insights and actionable recommendations for decision-makers',
  copyMarkdown: 'Copy as Markdown',
  print: 'Print',
  reportMetadata: 'Report Metadata',
  generatedOn: 'Generated on',
  documentsAnalyzed: 'Documents Analyzed',
  executiveSummary: 'Executive Summary',
  keyFindings: 'Key Findings',
  strategicRecommendations: 'Strategic Recommendations',
  recommendationsDescription: 'Actionable recommendations prioritized by impact and urgency',
  risksWatchouts: 'Risks & Watchouts',
  nextSteps: 'Next Steps',
  noDataTitle: 'No Data Available',
  noDataDescription: 'There is no data to generate a strategic report. Please upload documents to the system first.',
  goToDashboard: 'Go to Dashboard',
  purchaseIntentionNotice: 'Note: Purchase Intention Data Not Available',
  purchaseIntentionNoticeDescription: 'This report is based on emotion and sentiment analysis. Purchase intention metrics are not included in the current analysis. For more comprehensive insights, consider enabling purchase intention tracking.',
  priorityHigh: 'HIGH',
  priorityMedium: 'MEDIUM',
  priorityLow: 'LOW',
  languageLabel: 'Language',
};

const ID_LABELS: UILabels = {
  pageTitle: 'Laporan Rekomendasi Strategis',
  pageDescription: 'Wawasan siap eksekutif dan rekomendasi yang dapat ditindaklanjuti untuk pengambil keputusan',
  copyMarkdown: 'Salin sebagai Markdown',
  print: 'Cetak',
  reportMetadata: 'Metadata Laporan',
  generatedOn: 'Dibuat pada',
  documentsAnalyzed: 'Dokumen Dianalisis',
  executiveSummary: 'Ringkasan Eksekutif',
  keyFindings: 'Temuan Utama',
  strategicRecommendations: 'Rekomendasi Strategis',
  recommendationsDescription: 'Rekomendasi yang dapat ditindaklanjuti diprioritaskan berdasarkan dampak dan urgensi',
  risksWatchouts: 'Risiko & Perhatian',
  nextSteps: 'Langkah Selanjutnya',
  noDataTitle: 'Tidak Ada Data Tersedia',
  noDataDescription: 'Tidak ada data untuk menghasilkan laporan strategis. Silakan unggah dokumen ke sistem terlebih dahulu.',
  goToDashboard: 'Ke Dasbor',
  purchaseIntentionNotice: 'Catatan: Data Niat Pembelian Tidak Tersedia',
  purchaseIntentionNoticeDescription: 'Laporan ini didasarkan pada analisis emosi dan sentimen. Metrik niat pembelian tidak termasuk dalam analisis saat ini. Untuk wawasan yang lebih komprehensif, pertimbangkan untuk mengaktifkan pelacakan niat pembelian.',
  priorityHigh: 'TINGGI',
  priorityMedium: 'SEDANG',
  priorityLow: 'RENDAH',
  languageLabel: 'Bahasa',
};

export function getUILabels(locale: Locale): UILabels {
  return locale === 'id' ? ID_LABELS : EN_LABELS;
}

export function getPriorityLabel(priority: 'high' | 'medium' | 'low', locale: Locale): string {
  const labels = getUILabels(locale);
  switch (priority) {
    case 'high':
      return labels.priorityHigh;
    case 'medium':
      return labels.priorityMedium;
    case 'low':
      return labels.priorityLow;
  }
}

// Report content translation templates
interface ReportContentTemplates {
  // Executive summary templates
  executiveSummaryTemplate: (
    docCount: number,
    dominantEmotion: string,
    recCount: number,
    highPriorityCount: number
  ) => string;
  
  // Key findings templates
  analyzedDocuments: (count: number) => string;
  dominantEmotions: (emotions: string) => string;
  psychoSocialFactors: (factors: string) => string;
  marketingFunnel: (strongest: string, strongestScore: number, weakest: string, weakestScore: number) => string;
  
  // Recommendation templates
  addressConcerns: {
    title: string;
    rationale: (percentage: number, emotion: string) => string;
  };
  capitalizePositive: {
    title: string;
    rationale: (percentage: number, emotion: string) => string;
  };
  leverageTrust: {
    title: string;
    rationale: (percentage: number) => string;
  };
  increaseBrandVisibility: {
    title: string;
    rationale: (score: number) => string;
  };
  strengthenProductInfo: {
    title: string;
    rationale: (score: number) => string;
  };
  implementIncentives: {
    title: string;
    rationale: (score: number) => string;
  };
  buildCommunity: {
    title: string;
    rationale: (score: number) => string;
  };
  mitigateRisk: {
    title: string;
    rationale: (dimension: string, score: number) => string;
  };
  amplifySocialProof: {
    title: string;
    rationale: (score: number) => string;
  };
  simplifyUX: {
    title: string;
    rationale: (score: number) => string;
  };
  focusMarketing: {
    title: string;
    rationale: (brand: string, mentions: number) => string;
  };
  expandDataCollection: {
    title: string;
    rationale: string;
  };
  
  // Risk templates
  highNegativeSentiment: (emotion: string, percentage: number) => string;
  elevatedAnxiety: (dimension: string, score: number) => string;
  criticalGap: (metric: string, score: number) => string;
  limitedDataset: string;
  
  // Next steps
  nextSteps: string[];
  
  // Empty state
  noDataSummary: string;
}

const EN_TEMPLATES: ReportContentTemplates = {
  executiveSummaryTemplate: (docCount, dominantEmotion, recCount, highPriorityCount) =>
    `Analysis of ${docCount} consumer sentiment documents reveals ${dominantEmotion} as the dominant emotional response to electric motorcycle brands. This report identifies ${recCount} strategic recommendations, including ${highPriorityCount} high-priority actions, to optimize market positioning and accelerate adoption. Key opportunities exist in addressing consumer concerns, strengthening marketing effectiveness, and leveraging positive sentiment for growth.`,
  
  analyzedDocuments: (count) => `Analyzed ${count} consumer sentiment documents across electric motorcycle brands.`,
  dominantEmotions: (emotions) => `Dominant emotions: ${emotions}.`,
  psychoSocialFactors: (factors) => `Key psycho-social factors: ${factors}.`,
  marketingFunnel: (strongest, strongestScore, weakest, weakestScore) =>
    `Marketing funnel: Strongest at ${strongest} (${strongestScore}/100), weakest at ${weakest} (${weakestScore}/100).`,
  
  addressConcerns: {
    title: 'Address Consumer Concerns Through Transparency',
    rationale: (percentage, emotion) =>
      `${percentage}% of sentiment shows ${emotion}, indicating significant consumer hesitation. Implement trust-building campaigns focusing on safety certifications, warranty programs, and real customer testimonials to reduce anxiety.`,
  },
  capitalizePositive: {
    title: 'Capitalize on Positive Sentiment with Conversion Campaigns',
    rationale: (percentage, emotion) =>
      `${percentage}% of sentiment reflects ${emotion}, showing strong market receptivity. Launch targeted conversion campaigns with limited-time offers and test-ride programs to convert interest into purchases.`,
  },
  leverageTrust: {
    title: 'Leverage Trust for Brand Advocacy Programs',
    rationale: (percentage) =>
      `${percentage}% of sentiment demonstrates trust, a valuable asset. Develop referral programs and brand ambassador initiatives to amplify positive word-of-mouth and expand market reach.`,
  },
  increaseBrandVisibility: {
    title: 'Increase Brand Visibility Through Multi-Channel Campaigns',
    rationale: (score) =>
      `Awareness scores at ${score}/100 indicate low brand recognition. Invest in digital advertising, influencer partnerships, and public events to increase top-of-mind awareness among target demographics.`,
  },
  strengthenProductInfo: {
    title: 'Strengthen Product Information and Comparison Tools',
    rationale: (score) =>
      `Consideration scores at ${score}/100 suggest consumers need more information. Develop detailed comparison guides, interactive product configurators, and educational content to support decision-making.`,
  },
  implementIncentives: {
    title: 'Implement Purchase Incentive Programs',
    rationale: (score) =>
      `Intent scores at ${score}/100 reveal a conversion gap. Introduce financing options, trade-in programs, and early-adopter discounts to lower purchase barriers and accelerate decision-making.`,
  },
  buildCommunity: {
    title: 'Build Community and Loyalty Programs',
    rationale: (score) =>
      `Advocacy scores at ${score}/100 indicate limited word-of-mouth. Create owner communities, loyalty rewards, and referral incentives to transform satisfied customers into brand advocates.`,
  },
  mitigateRisk: {
    title: 'Mitigate Risk Perception with Comprehensive Support',
    rationale: (dimension, score) =>
      `High ${dimension} scores (${score}/100) indicate consumer uncertainty. Offer extended warranties, 24/7 customer support, and money-back guarantees to reduce perceived risk and build confidence.`,
  },
  amplifySocialProof: {
    title: 'Amplify Social Proof and Community Engagement',
    rationale: (score) =>
      `Strong Social Influence signals (${score}/100) show peer recommendations matter. Showcase user-generated content, customer reviews, and community events to leverage social validation.`,
  },
  simplifyUX: {
    title: 'Simplify User Experience and Onboarding',
    rationale: (score) =>
      `Self-Efficacy scores (${score}/100) suggest consumers value ease of use. Provide comprehensive tutorials, intuitive interfaces, and hands-on training sessions to boost user confidence.`,
  },
  focusMarketing: {
    title: 'Focus Marketing Resources on High-Engagement Brands',
    rationale: (brand, mentions) =>
      `${brand} dominates conversation with ${mentions} mentions. Allocate marketing budget proportionally to high-engagement brands while investigating why others receive less attention.`,
  },
  expandDataCollection: {
    title: 'Expand Data Collection for Deeper Insights',
    rationale: 'Current dataset provides limited signals. Implement systematic feedback collection across customer touchpoints to enable more granular strategic analysis and targeted interventions.',
  },
  
  highNegativeSentiment: (emotion, percentage) =>
    `High negative sentiment (${emotion}: ${percentage}%) may slow adoption rates if not addressed promptly.`,
  elevatedAnxiety: (dimension, score) =>
    `Elevated ${dimension} (${score}/100) indicates consumers perceive significant barriers to adoption.`,
  criticalGap: (metric, score) =>
    `Critical gap in ${metric} (${score}/100) may limit market penetration and revenue growth.`,
  limitedDataset: 'Limited dataset size may not capture full market sentiment. Expand data collection to validate findings.',
  
  nextSteps: [
    'Present findings to marketing and product teams for strategic alignment.',
    'Develop detailed action plans for each high-priority recommendation with timelines and KPIs.',
    'Establish monitoring dashboard to track sentiment changes and campaign effectiveness.',
    'Schedule quarterly reviews to reassess strategy based on updated market data.',
    'Allocate budget and resources to address identified gaps in the marketing funnel.',
  ],
  
  noDataSummary: 'No data available for analysis. Upload documents to generate strategic recommendations.',
};

const ID_TEMPLATES: ReportContentTemplates = {
  executiveSummaryTemplate: (docCount, dominantEmotion, recCount, highPriorityCount) =>
    `Analisis ${docCount} dokumen sentimen konsumen mengungkapkan ${dominantEmotion} sebagai respons emosional dominan terhadap merek sepeda motor listrik. Laporan ini mengidentifikasi ${recCount} rekomendasi strategis, termasuk ${highPriorityCount} tindakan prioritas tinggi, untuk mengoptimalkan posisi pasar dan mempercepat adopsi. Peluang utama ada dalam mengatasi kekhawatiran konsumen, memperkuat efektivitas pemasaran, dan memanfaatkan sentimen positif untuk pertumbuhan.`,
  
  analyzedDocuments: (count) => `Menganalisis ${count} dokumen sentimen konsumen di berbagai merek sepeda motor listrik.`,
  dominantEmotions: (emotions) => `Emosi dominan: ${emotions}.`,
  psychoSocialFactors: (factors) => `Faktor psiko-sosial utama: ${factors}.`,
  marketingFunnel: (strongest, strongestScore, weakest, weakestScore) =>
    `Corong pemasaran: Terkuat pada ${strongest} (${strongestScore}/100), terlemah pada ${weakest} (${weakestScore}/100).`,
  
  addressConcerns: {
    title: 'Atasi Kekhawatiran Konsumen Melalui Transparansi',
    rationale: (percentage, emotion) =>
      `${percentage}% sentimen menunjukkan ${emotion}, mengindikasikan keraguan konsumen yang signifikan. Terapkan kampanye membangun kepercayaan yang berfokus pada sertifikasi keamanan, program garansi, dan testimoni pelanggan nyata untuk mengurangi kecemasan.`,
  },
  capitalizePositive: {
    title: 'Manfaatkan Sentimen Positif dengan Kampanye Konversi',
    rationale: (percentage, emotion) =>
      `${percentage}% sentimen mencerminkan ${emotion}, menunjukkan penerimaan pasar yang kuat. Luncurkan kampanye konversi yang ditargetkan dengan penawaran terbatas dan program uji coba untuk mengubah minat menjadi pembelian.`,
  },
  leverageTrust: {
    title: 'Manfaatkan Kepercayaan untuk Program Advokasi Merek',
    rationale: (percentage) =>
      `${percentage}% sentimen menunjukkan kepercayaan, aset yang berharga. Kembangkan program rujukan dan inisiatif duta merek untuk memperkuat word-of-mouth positif dan memperluas jangkauan pasar.`,
  },
  increaseBrandVisibility: {
    title: 'Tingkatkan Visibilitas Merek Melalui Kampanye Multi-Saluran',
    rationale: (score) =>
      `Skor kesadaran pada ${score}/100 menunjukkan pengenalan merek yang rendah. Investasikan dalam iklan digital, kemitraan influencer, dan acara publik untuk meningkatkan kesadaran top-of-mind di antara demografi target.`,
  },
  strengthenProductInfo: {
    title: 'Perkuat Informasi Produk dan Alat Perbandingan',
    rationale: (score) =>
      `Skor pertimbangan pada ${score}/100 menunjukkan konsumen membutuhkan lebih banyak informasi. Kembangkan panduan perbandingan terperinci, konfigurator produk interaktif, dan konten edukatif untuk mendukung pengambilan keputusan.`,
  },
  implementIncentives: {
    title: 'Terapkan Program Insentif Pembelian',
    rationale: (score) =>
      `Skor niat pada ${score}/100 mengungkapkan kesenjangan konversi. Perkenalkan opsi pembiayaan, program tukar tambah, dan diskon early-adopter untuk menurunkan hambatan pembelian dan mempercepat pengambilan keputusan.`,
  },
  buildCommunity: {
    title: 'Bangun Komunitas dan Program Loyalitas',
    rationale: (score) =>
      `Skor advokasi pada ${score}/100 menunjukkan word-of-mouth yang terbatas. Ciptakan komunitas pemilik, hadiah loyalitas, dan insentif rujukan untuk mengubah pelanggan yang puas menjadi advokat merek.`,
  },
  mitigateRisk: {
    title: 'Kurangi Persepsi Risiko dengan Dukungan Komprehensif',
    rationale: (dimension, score) =>
      `Skor ${dimension} yang tinggi (${score}/100) menunjukkan ketidakpastian konsumen. Tawarkan garansi diperpanjang, dukungan pelanggan 24/7, dan jaminan uang kembali untuk mengurangi risiko yang dirasakan dan membangun kepercayaan.`,
  },
  amplifySocialProof: {
    title: 'Perkuat Bukti Sosial dan Keterlibatan Komunitas',
    rationale: (score) =>
      `Sinyal Pengaruh Sosial yang kuat (${score}/100) menunjukkan rekomendasi rekan penting. Tampilkan konten yang dibuat pengguna, ulasan pelanggan, dan acara komunitas untuk memanfaatkan validasi sosial.`,
  },
  simplifyUX: {
    title: 'Sederhanakan Pengalaman Pengguna dan Onboarding',
    rationale: (score) =>
      `Skor Self-Efficacy (${score}/100) menunjukkan konsumen menghargai kemudahan penggunaan. Sediakan tutorial komprehensif, antarmuka intuitif, dan sesi pelatihan langsung untuk meningkatkan kepercayaan pengguna.`,
  },
  focusMarketing: {
    title: 'Fokuskan Sumber Daya Pemasaran pada Merek dengan Keterlibatan Tinggi',
    rationale: (brand, mentions) =>
      `${brand} mendominasi percakapan dengan ${mentions} penyebutan. Alokasikan anggaran pemasaran secara proporsional ke merek dengan keterlibatan tinggi sambil menyelidiki mengapa yang lain menerima perhatian lebih sedikit.`,
  },
  expandDataCollection: {
    title: 'Perluas Pengumpulan Data untuk Wawasan yang Lebih Dalam',
    rationale: 'Dataset saat ini memberikan sinyal terbatas. Terapkan pengumpulan umpan balik sistematis di seluruh titik sentuh pelanggan untuk memungkinkan analisis strategis yang lebih granular dan intervensi yang ditargetkan.',
  },
  
  highNegativeSentiment: (emotion, percentage) =>
    `Sentimen negatif yang tinggi (${emotion}: ${percentage}%) dapat memperlambat tingkat adopsi jika tidak segera ditangani.`,
  elevatedAnxiety: (dimension, score) =>
    `${dimension} yang meningkat (${score}/100) menunjukkan konsumen melihat hambatan signifikan untuk adopsi.`,
  criticalGap: (metric, score) =>
    `Kesenjangan kritis dalam ${metric} (${score}/100) dapat membatasi penetrasi pasar dan pertumbuhan pendapatan.`,
  limitedDataset: 'Ukuran dataset terbatas mungkin tidak menangkap sentimen pasar penuh. Perluas pengumpulan data untuk memvalidasi temuan.',
  
  nextSteps: [
    'Presentasikan temuan kepada tim pemasaran dan produk untuk penyelarasan strategis.',
    'Kembangkan rencana aksi terperinci untuk setiap rekomendasi prioritas tinggi dengan timeline dan KPI.',
    'Buat dashboard pemantauan untuk melacak perubahan sentimen dan efektivitas kampanye.',
    'Jadwalkan tinjauan triwulanan untuk menilai kembali strategi berdasarkan data pasar yang diperbarui.',
    'Alokasikan anggaran dan sumber daya untuk mengatasi kesenjangan yang teridentifikasi dalam corong pemasaran.',
  ],
  
  noDataSummary: 'Tidak ada data tersedia untuk analisis. Unggah dokumen untuk menghasilkan rekomendasi strategis.',
};

export function getReportTemplates(locale: Locale): ReportContentTemplates {
  return locale === 'id' ? ID_TEMPLATES : EN_TEMPLATES;
}

// Emotion translation map
const EMOTION_TRANSLATIONS: Record<string, { en: string; id: string }> = {
  interest: { en: 'interest', id: 'minat' },
  trust: { en: 'trust', id: 'kepercayaan' },
  fear: { en: 'fear', id: 'ketakutan' },
  skepticism: { en: 'skepticism', id: 'skeptisisme' },
  satisfaction: { en: 'satisfaction', id: 'kepuasan' },
  mixed: { en: 'mixed', id: 'campuran' },
};

export function translateEmotion(emotion: string, locale: Locale): string {
  const translation = EMOTION_TRANSLATIONS[emotion.toLowerCase()];
  if (!translation) return emotion;
  return locale === 'id' ? translation.id : translation.en;
}
