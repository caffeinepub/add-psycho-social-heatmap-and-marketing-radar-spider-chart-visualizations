/**
 * RFC4180-compliant CSV tokenizer/parser
 * Supports quoted fields containing commas, newlines, and escaped quotes
 */

export interface ParseStats {
  totalRows: number;
  fieldCountsPerRow: number[];
}

export interface RFC4180ParseResult {
  rows: string[][];
  stats: ParseStats;
}

/**
 * Parse CSV content according to RFC4180 specification
 * Handles:
 * - Quoted fields with commas: "text, with comma"
 * - Quoted fields with newlines: "text\nwith\nnewline"
 * - Escaped quotes: "text with ""quotes"""
 * - Mixed quoted and unquoted fields
 */
export function parseRFC4180CSV(content: string): RFC4180ParseResult {
  const rows: string[][] = [];
  const fieldCountsPerRow: number[] = [];
  
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;
  
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === '"') {
      if (!insideQuotes) {
        // Start of quoted field
        insideQuotes = true;
        i++;
        continue;
      } else if (nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i += 2;
        continue;
      } else {
        // End of quoted field
        insideQuotes = false;
        i++;
        continue;
      }
    }
    
    if (!insideQuotes) {
      if (char === ',') {
        // Field separator
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      }
      
      if (char === '\r' && nextChar === '\n') {
        // CRLF line ending
        currentRow.push(currentField);
        if (currentRow.length > 0 || currentField !== '') {
          rows.push(currentRow);
          fieldCountsPerRow.push(currentRow.length);
        }
        currentRow = [];
        currentField = '';
        i += 2;
        continue;
      }
      
      if (char === '\n' || char === '\r') {
        // LF or CR line ending
        currentRow.push(currentField);
        if (currentRow.length > 0 || currentField !== '') {
          rows.push(currentRow);
          fieldCountsPerRow.push(currentRow.length);
        }
        currentRow = [];
        currentField = '';
        i++;
        continue;
      }
    }
    
    // Regular character (or newline inside quotes)
    currentField += char;
    i++;
  }
  
  // Push last field and row if any
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
    fieldCountsPerRow.push(currentRow.length);
  }
  
  return {
    rows,
    stats: {
      totalRows: rows.length,
      fieldCountsPerRow,
    },
  };
}

/**
 * Trim whitespace from all fields in a row
 */
export function trimFields(row: string[]): string[] {
  return row.map(field => field.trim());
}
