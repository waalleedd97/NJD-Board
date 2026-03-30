export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSV(content: string): ParsedCSV {
  let text = content.replace(/^\uFEFF/, '');
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (!text.trim()) return { headers: [], rows: [] };

  const lines = tokenize(text);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i];
    if (cells.length === 1 && cells[0] === '') continue;

    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = (cells[j] || '').trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

function tokenize(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field.trim());
      field = '';
    } else if (ch === '\n') {
      row.push(field.trim());
      result.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field || row.length > 0) {
    row.push(field.trim());
    result.push(row);
  }

  return result;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
