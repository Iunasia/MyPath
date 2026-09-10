import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

/** One data row, keyed by its normalized column header. */
export type SheetRow = Record<string, string>;

export interface LoadedSheet {
  file: string;
  sheet: string;
  /** Normalized headers, in column order. */
  headers: string[];
  rows: SheetRow[];
}

/**
 * ExcelJS returns cell values as strings, numbers, Dates, or objects
 * (hyperlinks, rich text, formula results). Flatten all of them to plain text.
 */
export const cellText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const v = value as Record<string, any>;
    if (Array.isArray(v.richText)) return v.richText.map((r: any) => r.text ?? '').join('');
    if (typeof v.text === 'string') return v.text;
    if (v.hyperlink) return String(v.hyperlink);
    if (v.result !== undefined) return cellText(v.result);
    if (v.error) return '';
    return '';
  }
  return String(value).trim();
};

/** "Field Fit (Data Sci/Tech)" -> "fieldfitdatascitech" */
export const normalizeHeader = (header: string): string =>
  header.toLowerCase().replace(/[^a-z0-9]/g, '');

const rowValues = (row: ExcelJS.Row, width: number): string[] => {
  const out: string[] = [];
  for (let col = 1; col <= width; col++) out.push(cellText(row.getCell(col).value).trim());
  return out;
};

/**
 * These workbooks start with title/intro rows before the real header, and the
 * header row is not at a fixed index across sheets. Find the first row that
 * looks like a header: enough filled cells, and at least two recognized names.
 */
const findHeaderRow = (
  sheet: ExcelJS.Worksheet,
  hints: Set<string>,
  scanDepth: number
): { index: number; headers: string[] } | null => {
  const width = Math.max(sheet.columnCount, 1);
  const limit = Math.min(sheet.rowCount, scanDepth);

  for (let i = 1; i <= limit; i++) {
    const values = rowValues(sheet.getRow(i), width);
    const filled = values.filter(Boolean);
    if (filled.length < 3) continue;

    const headers = values.map(normalizeHeader);
    const recognized = headers.filter(h => h && hints.has(h)).length;
    if (recognized >= 2) return { index: i, headers };
  }
  return null;
};

export interface LoadOptions {
  /** Normalized header names that mark a row as the header row. */
  headerHints: string[];
  /** How many leading rows to scan for the header. */
  scanDepth?: number;
}

/** Read one workbook, returning only the sheets that have a detectable header. */
export const loadWorkbook = async (
  filePath: string,
  options: LoadOptions
): Promise<LoadedSheet[]> => {
  const hints = new Set(options.headerHints.map(normalizeHeader));
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const loaded: LoadedSheet[] = [];

  workbook.eachSheet(sheet => {
    const header = findHeaderRow(sheet, hints, options.scanDepth ?? 12);
    if (!header) return; // Overview / checklist tabs — no tabular data.

    const width = header.headers.length;
    const rows: SheetRow[] = [];

    for (let i = header.index + 1; i <= sheet.rowCount; i++) {
      const values = rowValues(sheet.getRow(i), width);
      if (values.every(v => v === '')) continue;

      const row: SheetRow = {};
      header.headers.forEach((name, col) => {
        if (name) row[name] = values[col] ?? '';
      });
      rows.push(row);
    }

    loaded.push({
      file: path.basename(filePath),
      sheet: sheet.name,
      headers: header.headers.filter(Boolean),
      rows
    });
  });

  return loaded;
};

/** Read every .xlsx in a directory (ignoring Excel's ~$ lock files). */
export const loadWorkbookDir = async (
  dir: string,
  options: LoadOptions
): Promise<LoadedSheet[]> => {
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter(f => /\.xlsx$/i.test(f) && !f.startsWith('~$'))
    .sort();

  const sheets: LoadedSheet[] = [];
  for (const file of files) {
    sheets.push(...(await loadWorkbook(path.join(dir, file), options)));
  }
  return sheets;
};
