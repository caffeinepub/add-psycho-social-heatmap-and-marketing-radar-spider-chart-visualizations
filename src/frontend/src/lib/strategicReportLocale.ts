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
  downloadPdf: string;
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
  downloadPdf: 'Download PDF',
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
  downloadPdf: 'Unduh PDF',
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
  amplifySocialProof: {
    title: string;
    rationale: (score: number) => string;
  };
  simplifyUX: {
    title: string;
    rationale: (score: number) => string;
  };
  addressPriceValue: {
    title: string;
    rationale: (score: number) => string;
  };
  improveFacilitating: {
    title: string;
    rationale: (score: number) => string;
  };
  enhanceExperience: {
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
  lowUTAUT2Score: (dimension: string, score: number) => string;
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
  psychoSocialFactors: (factors) => `Key UTAUT2 constructs requiring attention: ${factors}.`,
  marketingFunnel: (strongest, strongestScore, weakest, weakestScore) =>
    `Marketing funnel analysis shows ${strongest} (${strongestScore}%) as the strongest stage and ${weakest} (${weakestScore}%) requiring improvement.`,
  
  addressConcerns: {
    title: 'Address Consumer Concerns and Barriers',
    rationale: (percentage, emotion) =>
      `${percentage.toFixed(1)}% of analyzed sentiment shows ${emotion}, indicating significant consumer hesitation. Implement targeted communication campaigns addressing specific concerns about battery life, charging infrastructure, and total cost of ownership.`,
  },
  capitalizePositive: {
    title: 'Capitalize on Positive Sentiment',
    rationale: (percentage, emotion) =>
      `${percentage.toFixed(1)}% of consumers express ${emotion}. Leverage this positive sentiment through testimonial campaigns, referral programs, and community-building initiatives to accelerate word-of-mouth adoption.`,
  },
  leverageTrust: {
    title: 'Leverage Trust for Conversion',
    rationale: (percentage) =>
      `${percentage.toFixed(1)}% trust signals present opportunity for conversion optimization. Strengthen credibility through certifications, warranties, and transparent performance data.`,
  },
  increaseBrandVisibility: {
    title: 'Increase Brand Awareness',
    rationale: (score) =>
      `Current awareness score of ${score.toFixed(0)}% indicates room for growth. Invest in multi-channel brand campaigns targeting early adopters and environmentally conscious consumers.`,
  },
  strengthenProductInfo: {
    title: 'Strengthen Product Information',
    rationale: (score) =>
      `Consideration stage score of ${score.toFixed(0)}% suggests information gaps. Develop comprehensive comparison tools, detailed specifications, and educational content addressing common questions.`,
  },
  implementIncentives: {
    title: 'Implement Purchase Incentives',
    rationale: (score) =>
      `Intent score of ${score.toFixed(0)}% shows conversion opportunity. Introduce time-limited promotions, trade-in programs, and financing options to reduce purchase barriers.`,
  },
  buildCommunity: {
    title: 'Build Advocacy Community',
    rationale: (score) =>
      `Advocacy score of ${score.toFixed(0)}% indicates untapped potential. Create owner communities, ambassador programs, and social sharing incentives to amplify positive experiences.`,
  },
  amplifySocialProof: {
    title: 'Amplify Social Influence',
    rationale: (score) =>
      `Social Influence (UTAUT2) score of ${score.toFixed(0)}% shows peer influence matters. Showcase user testimonials, influencer partnerships, and community success stories prominently.`,
  },
  simplifyUX: {
    title: 'Simplify User Experience',
    rationale: (score) =>
      `Effort Expectancy score of ${score.toFixed(0)}% suggests usability concerns. Streamline purchase process, improve dealer experience, and provide clear setup guidance.`,
  },
  addressPriceValue: {
    title: 'Communicate Value Proposition',
    rationale: (score) =>
      `Price Value perception at ${score.toFixed(0)}% needs strengthening. Highlight total cost of ownership savings, government incentives, and long-term benefits through transparent cost calculators.`,
  },
  improveFacilitating: {
    title: 'Improve Facilitating Conditions',
    rationale: (score) =>
      `Facilitating Conditions score of ${score.toFixed(0)}% indicates infrastructure concerns. Partner with charging networks, provide home installation support, and communicate service availability.`,
  },
  enhanceExperience: {
    title: 'Enhance Hedonic Experience',
    rationale: (score) =>
      `Hedonic Motivation at ${score.toFixed(0)}% shows opportunity to emphasize enjoyment. Highlight performance, design aesthetics, and the premium riding experience in marketing materials.`,
  },
  focusMarketing: {
    title: 'Focus Marketing on High-Engagement Brands',
    rationale: (brand, mentions) =>
      `${brand} shows ${mentions} mentions, indicating strong consumer interest. Allocate marketing resources to capitalize on existing brand momentum and awareness.`,
  },
  expandDataCollection: {
    title: 'Expand Data Collection',
    rationale: 'Current analysis is based on limited data points. Implement systematic feedback collection, surveys, and social listening to enhance insight accuracy and coverage.',
  },
  
  highNegativeSentiment: (emotion, percentage) =>
    `High ${emotion} sentiment (${percentage.toFixed(1)}%) may slow adoption if not addressed through targeted communication and product improvements.`,
  lowUTAUT2Score: (dimension, score) =>
    `Low ${dimension} score (${score.toFixed(0)}%) represents a critical barrier to adoption requiring immediate strategic attention.`,
  criticalGap: (metric, score) =>
    `${metric} gap (${score.toFixed(0)}%) indicates a weak point in the customer journey that competitors may exploit.`,
  limitedDataset: 'Analysis based on limited dataset may not capture full market dynamics. Expand data collection for more robust insights.',
  
  nextSteps: [
    'Conduct deep-dive analysis on high-priority recommendations to develop detailed implementation plans.',
    'Establish KPIs and tracking mechanisms for each strategic initiative.',
    'Allocate budget and resources based on recommendation priorities.',
    'Launch pilot programs for high-impact, low-effort recommendations.',
    'Schedule monthly review cycles to monitor sentiment shifts and adjust strategies.',
    'Expand data collection through surveys, focus groups, and social listening tools.',
  ],
  
  noDataSummary: 'No consumer sentiment data available for analysis. Please upload documents to generate strategic recommendations.',
};

const ID_TEMPLATES: ReportContentTemplates = {
  executiveSummaryTemplate: (docCount, dominantEmotion, recCount, highPriorityCount) =>
    `Analisis terhadap ${docCount} dokumen sentimen konsumen mengungkapkan ${dominantEmotion} sebagai respons emosional dominan terhadap merek sepeda motor listrik. Laporan ini mengidentifikasi ${recCount} rekomendasi strategis, termasuk ${highPriorityCount} tindakan prioritas tinggi, untuk mengoptimalkan posisi pasar dan mempercepat adopsi. Peluang utama ada dalam mengatasi kekhawatiran konsumen, memperkuat efektivitas pemasaran, dan memanfaatkan sentimen positif untuk pertumbuhan.`,
  
  analyzedDocuments: (count) => `Menganalisis ${count} dokumen sentimen konsumen di berbagai merek sepeda motor listrik.`,
  dominantEmotions: (emotions) => `Emosi dominan: ${emotions}.`,
  psychoSocialFactors: (factors) => `Konstruk UTAUT2 utama yang memerlukan perhatian: ${factors}.`,
  marketingFunnel: (strongest, strongestScore, weakest, weakestScore) =>
    `Analisis corong pemasaran menunjukkan ${strongest} (${strongestScore}%) sebagai tahap terkuat dan ${weakest} (${weakestScore}%) memerlukan perbaikan.`,
  
  addressConcerns: {
    title: 'Atasi Kekhawatiran dan Hambatan Konsumen',
    rationale: (percentage, emotion) =>
      `${percentage.toFixed(1)}% dari sentimen yang dianalisis menunjukkan ${emotion}, mengindikasikan keraguan konsumen yang signifikan. Terapkan kampanye komunikasi terarah yang mengatasi kekhawatiran spesifik tentang daya tahan baterai, infrastruktur pengisian, dan total biaya kepemilikan.`,
  },
  capitalizePositive: {
    title: 'Manfaatkan Sentimen Positif',
    rationale: (percentage, emotion) =>
      `${percentage.toFixed(1)}% konsumen mengekspresikan ${emotion}. Manfaatkan sentimen positif ini melalui kampanye testimoni, program rujukan, dan inisiatif membangun komunitas untuk mempercepat adopsi dari mulut ke mulut.`,
  },
  leverageTrust: {
    title: 'Manfaatkan Kepercayaan untuk Konversi',
    rationale: (percentage) =>
      `${percentage.toFixed(1)}% sinyal kepercayaan menghadirkan peluang untuk optimasi konversi. Perkuat kredibilitas melalui sertifikasi, garansi, dan data kinerja yang transparan.`,
  },
  increaseBrandVisibility: {
    title: 'Tingkatkan Kesadaran Merek',
    rationale: (score) =>
      `Skor kesadaran saat ini sebesar ${score.toFixed(0)}% menunjukkan ruang untuk pertumbuhan. Investasikan dalam kampanye merek multi-saluran yang menargetkan early adopter dan konsumen yang peduli lingkungan.`,
  },
  strengthenProductInfo: {
    title: 'Perkuat Informasi Produk',
    rationale: (score) =>
      `Skor tahap pertimbangan sebesar ${score.toFixed(0)}% menunjukkan kesenjangan informasi. Kembangkan alat perbandingan komprehensif, spesifikasi detail, dan konten edukatif yang menjawab pertanyaan umum.`,
  },
  implementIncentives: {
    title: 'Terapkan Insentif Pembelian',
    rationale: (score) =>
      `Skor niat sebesar ${score.toFixed(0)}% menunjukkan peluang konversi. Perkenalkan promosi terbatas waktu, program tukar tambah, dan opsi pembiayaan untuk mengurangi hambatan pembelian.`,
  },
  buildCommunity: {
    title: 'Bangun Komunitas Advokasi',
    rationale: (score) =>
      `Skor advokasi sebesar ${score.toFixed(0)}% menunjukkan potensi yang belum dimanfaatkan. Ciptakan komunitas pemilik, program duta, dan insentif berbagi sosial untuk memperkuat pengalaman positif.`,
  },
  amplifySocialProof: {
    title: 'Perkuat Pengaruh Sosial',
    rationale: (score) =>
      `Skor Pengaruh Sosial (UTAUT2) sebesar ${score.toFixed(0)}% menunjukkan pengaruh rekan penting. Tampilkan testimoni pengguna, kemitraan influencer, dan kisah sukses komunitas secara menonjol.`,
  },
  simplifyUX: {
    title: 'Sederhanakan Pengalaman Pengguna',
    rationale: (score) =>
      `Skor Ekspektasi Usaha sebesar ${score.toFixed(0)}% menunjukkan kekhawatiran kegunaan. Sederhanakan proses pembelian, tingkatkan pengalaman dealer, dan berikan panduan pengaturan yang jelas.`,
  },
  addressPriceValue: {
    title: 'Komunikasikan Proposisi Nilai',
    rationale: (score) =>
      `Persepsi Nilai Harga pada ${score.toFixed(0)}% perlu diperkuat. Soroti penghematan total biaya kepemilikan, insentif pemerintah, dan manfaat jangka panjang melalui kalkulator biaya yang transparan.`,
  },
  improveFacilitating: {
    title: 'Tingkatkan Kondisi Fasilitasi',
    rationale: (score) =>
      `Skor Kondisi Fasilitasi sebesar ${score.toFixed(0)}% menunjukkan kekhawatiran infrastruktur. Bermitra dengan jaringan pengisian, berikan dukungan instalasi rumah, dan komunikasikan ketersediaan layanan.`,
  },
  enhanceExperience: {
    title: 'Tingkatkan Pengalaman Hedonis',
    rationale: (score) =>
      `Motivasi Hedonis pada ${score.toFixed(0)}% menunjukkan peluang untuk menekankan kenikmatan. Soroti kinerja, estetika desain, dan pengalaman berkendara premium dalam materi pemasaran.`,
  },
  focusMarketing: {
    title: 'Fokuskan Pemasaran pada Merek dengan Keterlibatan Tinggi',
    rationale: (brand, mentions) =>
      `${brand} menunjukkan ${mentions} penyebutan, mengindikasikan minat konsumen yang kuat. Alokasikan sumber daya pemasaran untuk memanfaatkan momentum dan kesadaran merek yang ada.`,
  },
  expandDataCollection: {
    title: 'Perluas Pengumpulan Data',
    rationale: 'Analisis saat ini didasarkan pada titik data terbatas. Terapkan pengumpulan umpan balik sistematis, survei, dan pemantauan sosial untuk meningkatkan akurasi dan cakupan wawasan.',
  },
  
  highNegativeSentiment: (emotion, percentage) =>
    `Sentimen ${emotion} yang tinggi (${percentage.toFixed(1)}%) dapat memperlambat adopsi jika tidak diatasi melalui komunikasi terarah dan perbaikan produk.`,
  lowUTAUT2Score: (dimension, score) =>
    `Skor ${dimension} yang rendah (${score.toFixed(0)}%) merupakan hambatan kritis untuk adopsi yang memerlukan perhatian strategis segera.`,
  criticalGap: (metric, score) =>
    `Kesenjangan ${metric} (${score.toFixed(0)}%) menunjukkan titik lemah dalam perjalanan pelanggan yang dapat dimanfaatkan pesaing.`,
  limitedDataset: 'Analisis berdasarkan dataset terbatas mungkin tidak menangkap dinamika pasar penuh. Perluas pengumpulan data untuk wawasan yang lebih kuat.',
  
  nextSteps: [
    'Lakukan analisis mendalam pada rekomendasi prioritas tinggi untuk mengembangkan rencana implementasi detail.',
    'Tetapkan KPI dan mekanisme pelacakan untuk setiap inisiatif strategis.',
    'Alokasikan anggaran dan sumber daya berdasarkan prioritas rekomendasi.',
    'Luncurkan program percontohan untuk rekomendasi berdampak tinggi dan upaya rendah.',
    'Jadwalkan siklus tinjauan bulanan untuk memantau pergeseran sentimen dan menyesuaikan strategi.',
    'Perluas pengumpulan data melalui survei, kelompok fokus, dan alat pemantauan sosial.',
  ],
  
  noDataSummary: 'Tidak ada data sentimen konsumen yang tersedia untuk analisis. Silakan unggah dokumen untuk menghasilkan rekomendasi strategis.',
};

export function getReportTemplates(locale: Locale): ReportContentTemplates {
  return locale === 'id' ? ID_TEMPLATES : EN_TEMPLATES;
}

// Emotion translations
export function translateEmotion(emotion: string, locale: Locale): string {
  if (locale === 'en') return emotion;
  
  const translations: Record<string, string> = {
    'interest': 'minat',
    'trust': 'kepercayaan',
    'fear': 'ketakutan',
    'skepticism': 'skeptisisme',
    'satisfaction': 'kepuasan',
    'joy': 'kegembiraan',
    'anticipation': 'antisipasi',
    'surprise': 'kejutan',
    'sadness': 'kesedihan',
    'disgust': 'jijik',
    'anger': 'kemarahan',
  };
  
  return translations[emotion.toLowerCase()] || emotion;
}
