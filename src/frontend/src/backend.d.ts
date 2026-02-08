import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IntentionTrend {
    id: bigint;
    trend: bigint;
    intentionLevel: string;
}
export interface ConfusionMatrixResult {
    model: string;
    confusionMatrix: Array<Array<number>>;
    emotions: Array<string>;
    confusionMatrixRaw: Array<Array<bigint>>;
}
export interface PurchaseIntention {
    level: string;
    score: bigint;
    gender?: string;
    brand?: string;
    location?: string;
}
export interface IntentionResult {
    brandCorrelation: Array<BrandIntentionCorrelation>;
    trends: Array<IntentionTrend>;
    individual: PurchaseIntention;
    distribution: PurchaseIntentionDistribution;
}
export interface GeoLocationDistribution {
    data: Array<Array<number>>;
    emotions: Array<string>;
    locations: Array<string>;
}
export interface GenderDistribution {
    emotionDistribution: Array<GenderDistributionEntry>;
    brandDistribution: Array<GenderDistributionEntry>;
}
export interface BrandIntentionCorrelation {
    low: bigint;
    high: bigint;
    brand: string;
    medium: bigint;
}
export interface Document {
    id: bigint;
    content: string;
    author: Principal;
    timestamp: bigint;
}
export type Principal = Principal;
export interface PurchaseIntentionDistribution {
    low: bigint;
    high: bigint;
    medium: bigint;
}
export interface GenderDistributionEntry {
    maleCount: number;
    femaleCount: number;
    category: string;
}
export interface CleaningLog {
    status: string;
    step: string;
    timestamp: bigint;
}
export interface BertResult {
    emotion: string;
    brandSpecific?: string;
    confidence: number;
}
export interface backendInterface {
    addCleaningLog(_logs: Array<CleaningLog>): Promise<bigint>;
    analyzeGenderDistribution(): Promise<GenderDistribution>;
    analyzeGeoDistribution(_texts: Array<Array<string>>): Promise<GeoLocationDistribution>;
    analyzeText(input: string): Promise<BertResult>;
    calculateIntention(input: string, gender: string, location: string, brand: string): Promise<IntentionResult>;
    deleteDocument(id: bigint): Promise<boolean>;
    getAllDocuments(): Promise<Array<Document>>;
    getCleaningLog(id: bigint): Promise<Array<CleaningLog> | null>;
    getConfusionMatrix(modelName: string): Promise<ConfusionMatrixResult>;
    getDocument(id: bigint): Promise<Document | null>;
    getLatestCleaningLog(): Promise<Array<CleaningLog> | null>;
    processCorrect(text: string): Promise<void>;
    processIncorrect(_content: string, model: string, actualEmotion: string, predictedEmotion: string): Promise<void>;
    resetAllData(): Promise<void>;
    resetModelData(modelName: string): Promise<void>;
    uploadDocument(content: string): Promise<bigint>;
}
