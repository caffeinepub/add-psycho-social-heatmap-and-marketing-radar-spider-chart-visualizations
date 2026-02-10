/**
 * Dataset ingestion utilities for parsing and validating CSV/JSON uploads
 * with the required schema: ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted
 * Supports optional intention_level and intention_score columns with auto-generation
 * RFC4180-compliant CSV parsing with quoted field support and deterministic recovery
 */

import { derivePurchaseIntentionFromText, validateIntentionScore, validateIntentionLevel } from './purchaseIntentionDerivation';
import { parseRFC4180CSV, trimFields } from './csvRfc4180';

export interface DatasetRow {
  ID?: string;
  Date?: string;
  Region?: string;
  Source?: string;
  User?: string;
  text: string;
  Aspect_Category?: string;
  Keywords_Extracted?: string;
  intention_level?: 'low' | 'medium' | 'high';
  intention_score?: number;
}

export interface ParseDiagnostics {
  normalizedHeaders: string[];
  textIndex: number;
  fieldCountsPerRow: number[];
  sampleRows: Array<{ rowIndex: number; fieldCount: number; fields: string[] }>;
  recoveryAppliedCount: number;
}

export interface ParseResult {
  success: boolean;
  rows: DatasetRow[];
  error?: string;
  skippedCount: number;
  validCount: number;
  diagnostics?: ParseDiagnostics;
}

/**
 * Normalize header/key names: case-insensitive, whitespace-tolerant, underscore/space variants
 */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_]+/g, '');
}

/**
 * Detect if a text value looks like a sentiment/category token rather than actual review text
 */
function isSuspiciousTextValue(text: string): boolean {
  const trimmed = text.trim();
  const sentimentTokens = ['positive', 'negative', 'neutral', 'high', 'medium', 'low'];
  
  // Check if it's a known sentiment token
  if (sentimentTokens.includes(trimmed.toLowerCase())) {
    return true;
  }
  
  // Check if it's unusually short (less than 10 characters)
  if (trimmed.length < 10) {
    return true;
  }
  
  return false;
}

/**
 * Find the most text-like field in a row (longest sentence-like content)
 */
function findBestTextCandidate(fields: string[]): { index: number; value: string } | null {
  let bestIndex = -1;
  let bestLength = 0;
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i].trim();
    // Look for fields that are at least 20 characters and contain spaces (sentence-like)
    if (field.length >= 20 && field.includes(' ')) {
      if (field.length > bestLength) {
        bestLength = field.length;
        bestIndex = i;
      }
    }
  }
  
  if (bestIndex !== -1) {
    return { index: bestIndex, value: fields[bestIndex].trim() };
  }
  
  return null;
}

/**
 * Attempt to recover from column misalignment by finding the best text candidate
 */
function recoverTextValue(fields: string[], textIndex: number, headers: string[]): { text: string; recovered: boolean } {
  const originalText = fields[textIndex]?.trim() || '';
  
  // If original text looks good, use it
  if (originalText && !isSuspiciousTextValue(originalText)) {
    return { text: originalText, recovered: false };
  }
  
  // Try to find a better candidate
  const candidate = findBestTextCandidate(fields);
  if (candidate && candidate.value) {
    return { text: candidate.value, recovered: true };
  }
  
  // Fall back to original even if suspicious
  return { text: originalText, recovered: false };
}

/**
 * Parse CSV content into rows with RFC4180 support and recovery
 */
function parseCSV(content: string): ParseResult {
  try {
    // Parse using RFC4180 tokenizer
    const { rows: rawRows, stats } = parseRFC4180CSV(content);
    
    if (rawRows.length < 2) {
      return {
        success: false,
        rows: [],
        error: 'CSV file is empty or has no data rows',
        skippedCount: 0,
        validCount: 0,
      };
    }

    // Parse and normalize header
    const headerRow = trimFields(rawRows[0]);
    const normalizedHeaders = headerRow.map(normalizeKey);
    
    // Check if 'text' column exists
    const textIndex = normalizedHeaders.findIndex(h => h === 'text');
    if (textIndex === -1) {
      return {
        success: false,
        rows: [],
        error: 'Required column "text" not found in CSV. Expected format: ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted',
        skippedCount: 0,
        validCount: 0,
        diagnostics: {
          normalizedHeaders,
          textIndex: -1,
          fieldCountsPerRow: stats.fieldCountsPerRow,
          sampleRows: rawRows.slice(0, 3).map((fields, idx) => ({
            rowIndex: idx,
            fieldCount: fields.length,
            fields: trimFields(fields),
          })),
          recoveryAppliedCount: 0,
        },
      };
    }

    // Find optional intention columns
    const intentionLevelIndex = normalizedHeaders.findIndex(h => h === 'intentionlevel');
    const intentionScoreIndex = normalizedHeaders.findIndex(h => h === 'intentionscore');

    // Parse data rows
    const rows: DatasetRow[] = [];
    let skippedCount = 0;
    let recoveryAppliedCount = 0;

    for (let i = 1; i < rawRows.length; i++) {
      const rawFields = trimFields(rawRows[i]);
      
      // Skip completely empty rows
      if (rawFields.every(f => !f)) {
        skippedCount++;
        continue;
      }
      
      // Attempt to recover text value if needed
      const { text: textValue, recovered } = recoverTextValue(rawFields, textIndex, headerRow);
      
      if (recovered) {
        recoveryAppliedCount++;
      }
      
      // Skip rows with empty text after recovery
      if (!textValue) {
        skippedCount++;
        continue;
      }

      // Build row object with normalized keys
      const row: DatasetRow = { text: textValue };
      
      // Map other fields
      for (let idx = 0; idx < headerRow.length && idx < rawFields.length; idx++) {
        const normalizedHeader = normalizedHeaders[idx];
        const value = rawFields[idx] || '';
        
        if (normalizedHeader === 'id') row.ID = value;
        else if (normalizedHeader === 'date') row.Date = value;
        else if (normalizedHeader === 'region') row.Region = value;
        else if (normalizedHeader === 'source') row.Source = value;
        else if (normalizedHeader === 'user') row.User = value;
        else if (normalizedHeader === 'aspectcategory') row.Aspect_Category = value;
        else if (normalizedHeader === 'keywordsextracted') row.Keywords_Extracted = value;
      }

      // Handle intention fields: use provided values or auto-generate
      let hasIntentionLevel = false;
      let hasIntentionScore = false;

      if (intentionLevelIndex !== -1 && intentionLevelIndex < rawFields.length && rawFields[intentionLevelIndex]) {
        row.intention_level = validateIntentionLevel(rawFields[intentionLevelIndex]);
        hasIntentionLevel = true;
      }

      if (intentionScoreIndex !== -1 && intentionScoreIndex < rawFields.length && rawFields[intentionScoreIndex]) {
        row.intention_score = validateIntentionScore(rawFields[intentionScoreIndex]);
        hasIntentionScore = true;
      }

      // Auto-generate missing intention fields
      if (!hasIntentionLevel || !hasIntentionScore) {
        const derived = derivePurchaseIntentionFromText(textValue);
        if (!hasIntentionLevel) {
          row.intention_level = derived.intention_level;
        }
        if (!hasIntentionScore) {
          row.intention_score = derived.intention_score;
        }
      }

      rows.push(row);
    }

    const diagnostics: ParseDiagnostics = {
      normalizedHeaders,
      textIndex,
      fieldCountsPerRow: stats.fieldCountsPerRow,
      sampleRows: rawRows.slice(0, Math.min(4, rawRows.length)).map((fields, idx) => ({
        rowIndex: idx,
        fieldCount: fields.length,
        fields: trimFields(fields).slice(0, 8), // Limit to first 8 fields for preview
      })),
      recoveryAppliedCount,
    };

    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'No valid rows with non-empty "text" column found',
        skippedCount,
        validCount: 0,
        diagnostics,
      };
    }

    return {
      success: true,
      rows,
      skippedCount,
      validCount: rows.length,
      diagnostics,
    };
  } catch (error) {
    return {
      success: false,
      rows: [],
      error: `Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      skippedCount: 0,
      validCount: 0,
    };
  }
}

/**
 * Parse JSON content into rows
 */
function parseJSON(content: string): ParseResult {
  try {
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return {
        success: false,
        rows: [],
        error: 'JSON file must contain an array of objects',
        skippedCount: 0,
        validCount: 0,
      };
    }

    if (data.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'JSON file is empty',
        skippedCount: 0,
        validCount: 0,
      };
    }

    // Check if 'text' field exists in at least one object
    const hasTextField = data.some(item => {
      if (typeof item !== 'object' || item === null) return false;
      const keys = Object.keys(item).map(normalizeKey);
      return keys.includes('text');
    });

    if (!hasTextField) {
      return {
        success: false,
        rows: [],
        error: 'Required field "text" not found in JSON. Expected format: array of objects with "text" key',
        skippedCount: 0,
        validCount: 0,
      };
    }

    // Parse rows
    const rows: DatasetRow[] = [];
    let skippedCount = 0;

    for (const item of data) {
      if (typeof item !== 'object' || item === null) {
        skippedCount++;
        continue;
      }

      // Find text field (case-insensitive)
      let textValue = '';
      for (const [key, value] of Object.entries(item)) {
        if (normalizeKey(key) === 'text') {
          textValue = String(value || '').trim();
          break;
        }
      }

      // Skip rows with empty text
      if (!textValue) {
        skippedCount++;
        continue;
      }

      // Build row object
      const row: DatasetRow = { text: textValue };

      let hasIntentionLevel = false;
      let hasIntentionScore = false;

      for (const [key, value] of Object.entries(item)) {
        const normalizedKey = normalizeKey(key);
        const strValue = String(value || '');

        if (normalizedKey === 'id') row.ID = strValue;
        else if (normalizedKey === 'date') row.Date = strValue;
        else if (normalizedKey === 'region') row.Region = strValue;
        else if (normalizedKey === 'source') row.Source = strValue;
        else if (normalizedKey === 'user') row.User = strValue;
        else if (normalizedKey === 'aspectcategory') row.Aspect_Category = strValue;
        else if (normalizedKey === 'keywordsextracted') row.Keywords_Extracted = strValue;
        else if (normalizedKey === 'intentionlevel') {
          row.intention_level = validateIntentionLevel(value);
          hasIntentionLevel = true;
        }
        else if (normalizedKey === 'intentionscore') {
          row.intention_score = validateIntentionScore(value);
          hasIntentionScore = true;
        }
      }

      // Auto-generate missing intention fields
      if (!hasIntentionLevel || !hasIntentionScore) {
        const derived = derivePurchaseIntentionFromText(textValue);
        if (!hasIntentionLevel) {
          row.intention_level = derived.intention_level;
        }
        if (!hasIntentionScore) {
          row.intention_score = derived.intention_score;
        }
      }

      rows.push(row);
    }

    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'No valid rows with non-empty "text" field found',
        skippedCount,
        validCount: 0,
      };
    }

    return {
      success: true,
      rows,
      skippedCount,
      validCount: rows.length,
    };
  } catch (error) {
    return {
      success: false,
      rows: [],
      error: `Failed to parse JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      skippedCount: 0,
      validCount: 0,
    };
  }
}

/**
 * Main entry point: parse dataset file based on extension
 */
export function parseDatasetFile(content: string, filename: string): ParseResult {
  const extension = filename.toLowerCase().split('.').pop();

  if (extension === 'csv') {
    return parseCSV(content);
  } else if (extension === 'json') {
    return parseJSON(content);
  } else {
    return {
      success: false,
      rows: [],
      error: `Unsupported file format: .${extension}. Use .csv or .json`,
      skippedCount: 0,
      validCount: 0,
    };
  }
}
