/**
 * Dataset ingestion utilities for parsing and validating CSV/JSON uploads
 * with the required schema: ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted
 */

export interface DatasetRow {
  ID?: string;
  Date?: string;
  Region?: string;
  Source?: string;
  User?: string;
  text: string;
  Aspect_Category?: string;
  Keywords_Extracted?: string;
}

export interface ParseResult {
  success: boolean;
  rows: DatasetRow[];
  error?: string;
  skippedCount: number;
  validCount: number;
}

/**
 * Normalize header/key names: case-insensitive, whitespace-tolerant
 */
function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Parse CSV content into rows
 */
function parseCSV(content: string): ParseResult {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        success: false,
        rows: [],
        error: 'File CSV kosong atau tidak memiliki data',
        skippedCount: 0,
        validCount: 0,
      };
    }

    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Normalize headers for matching
    const normalizedHeaders = headers.map(normalizeKey);
    
    // Check if 'text' column exists
    const textIndex = normalizedHeaders.findIndex(h => h === 'text');
    if (textIndex === -1) {
      return {
        success: false,
        rows: [],
        error: 'Kolom "text" wajib ada dalam file CSV. Format yang diperlukan: ID,Date,Region,Source,User,text,Aspect_Category,Keywords_Extracted',
        skippedCount: 0,
        validCount: 0,
      };
    }

    // Parse data rows
    const rows: DatasetRow[] = [];
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      // Get text value
      const textValue = values[textIndex] || '';
      
      // Skip rows with empty text
      if (!textValue) {
        skippedCount++;
        continue;
      }

      // Build row object with normalized keys
      const row: DatasetRow = { text: textValue };
      
      headers.forEach((header, idx) => {
        const normalizedHeader = normalizeKey(header);
        const value = values[idx] || '';
        
        if (normalizedHeader === 'id') row.ID = value;
        else if (normalizedHeader === 'date') row.Date = value;
        else if (normalizedHeader === 'region') row.Region = value;
        else if (normalizedHeader === 'source') row.Source = value;
        else if (normalizedHeader === 'user') row.User = value;
        else if (normalizedHeader === 'aspect_category' || normalizedHeader === 'aspectcategory') row.Aspect_Category = value;
        else if (normalizedHeader === 'keywords_extracted' || normalizedHeader === 'keywordsextracted') row.Keywords_Extracted = value;
      });

      rows.push(row);
    }

    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'Tidak ada baris valid dengan kolom "text" yang terisi',
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
      error: `Gagal mem-parse file CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        error: 'File JSON harus berisi array of objects',
        skippedCount: 0,
        validCount: 0,
      };
    }

    if (data.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'File JSON kosong',
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
        error: 'Kolom "text" wajib ada dalam file JSON. Format yang diperlukan: array of objects dengan key "text"',
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

      for (const [key, value] of Object.entries(item)) {
        const normalizedKey = normalizeKey(key);
        const strValue = String(value || '');

        if (normalizedKey === 'id') row.ID = strValue;
        else if (normalizedKey === 'date') row.Date = strValue;
        else if (normalizedKey === 'region') row.Region = strValue;
        else if (normalizedKey === 'source') row.Source = strValue;
        else if (normalizedKey === 'user') row.User = strValue;
        else if (normalizedKey === 'aspect_category' || normalizedKey === 'aspectcategory') row.Aspect_Category = strValue;
        else if (normalizedKey === 'keywords_extracted' || normalizedKey === 'keywordsextracted') row.Keywords_Extracted = strValue;
      }

      rows.push(row);
    }

    if (rows.length === 0) {
      return {
        success: false,
        rows: [],
        error: 'Tidak ada baris valid dengan kolom "text" yang terisi',
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
      error: `Gagal mem-parse file JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      error: `Format file tidak didukung: .${extension}. Gunakan .csv atau .json`,
      skippedCount: 0,
      validCount: 0,
    };
  }
}
