import type { Pool } from 'pg';
import { CONTENT_TABLES, NATURAL_KEY } from './schema';

/**
 * Loading of spreadsheet content.
 *
 * The catalogue is now owned by the database — admins edit it in the app — so
 * the default mode is **insert-only**: a re-seed fills gaps but never
 * overwrites or deletes a row someone has changed. `mode: 'sync'` restores the
 * old sheet-authoritative behaviour (update every column, delete rows missing
 * from the sheet) for teams that still want the sheets to win.
 */

export type UpsertMode = 'insert' | 'sync';

export interface UpsertSummary {
  table: string;
  inserted: number;
  updated: number;
  deleted: number;
  skipped: number;
}

type Row = Record<string, unknown>;
type ContentTable = (typeof CONTENT_TABLES)[number];

/**
 * Columns an admin can set in the app. The sheet's "Last verified" column is
 * usually blank, and a blank cell must not wipe a check someone recorded —
 * so keep whichever date is more recent. GREATEST ignores NULLs.
 */
const PRESERVED: Partial<Record<ContentTable, Record<string, string>>> = {
  scholarships: {
    last_verified: 'GREATEST(EXCLUDED.last_verified, scholarships.last_verified)'
  }
};

/** A newer date from the sheet has no known checker, so the name goes with the old date. */
const LAST_VERIFIED_BY =
  'last_verified_by = CASE WHEN EXCLUDED.last_verified > scholarships.last_verified THEN NULL ELSE scholarships.last_verified_by END';

/**
 * Insert rows that are not present yet. `xmax = 0` is Postgres's way of saying
 * "this row was inserted, not updated"; with DO NOTHING a conflict returns no
 * row at all, which is how a skip is detected.
 */
const insertOnly = async (
  pool: Pool,
  table: ContentTable,
  rows: Row[],
  summary: UpsertSummary
): Promise<void> => {
  const key = NATURAL_KEY[table];

  for (const row of rows) {
    const columns = Object.keys(row);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const res = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (${key}) DO NOTHING
       RETURNING (xmax = 0) AS inserted`,
      Object.values(row)
    );

    if (res.rows[0]?.inserted) summary.inserted++;
    else summary.skipped++;
  }
};

/**
 * The sheet-authoritative path: insert-or-update every row, then delete records
 * whose natural key no longer appears in the sheet. `xmax = 0` splits the
 * inserted from the updated counts.
 */
const syncAll = async (
  pool: Pool,
  table: ContentTable,
  rows: Row[],
  summary: UpsertSummary
): Promise<void> => {
  const key = NATURAL_KEY[table];
  const keys: unknown[] = [];

  for (const row of rows) {
    const columns = Object.keys(row);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    // Every column except the key is refreshed from the sheet, apart from the
    // ones people set in the app.
    const updates = columns
      .filter(column => column !== key)
      .map(column => `${column} = ${PRESERVED[table]?.[column] ?? `EXCLUDED.${column}`}`);
    if (table === 'scholarships' && columns.includes('last_verified')) updates.push(LAST_VERIFIED_BY);

    const res = await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')})
       VALUES (${placeholders})
       ON CONFLICT (${key}) DO UPDATE SET ${updates.join(', ')}
       RETURNING (xmax = 0) AS inserted`,
      Object.values(row)
    );

    if (res.rows[0]?.inserted) summary.inserted++;
    else summary.updated++;

    keys.push(row[key]);
  }

  if (keys.length > 0) {
    const res = await pool.query(
      `DELETE FROM ${table} WHERE ${key} <> ALL($1::text[])`,
      [keys]
    );
    summary.deleted = res.rowCount ?? 0;
  }
};

export const upsertTable = async (
  pool: Pool,
  table: ContentTable,
  rows: Row[],
  options: { mode?: UpsertMode } = {}
): Promise<UpsertSummary> => {
  const summary: UpsertSummary = { table, inserted: 0, updated: 0, deleted: 0, skipped: 0 };

  if ((options.mode ?? 'insert') === 'insert') {
    await insertOnly(pool, table, rows, summary);
  } else {
    await syncAll(pool, table, rows, summary);
  }

  return summary;
};

/**
 * Drops content that is no longer in any sheet. User tables are untouched.
 * Used by the destructive `--replace` path, which still preserves accounts.
 */
export const clearContentTables = async (pool: Pool): Promise<void> => {
  for (const table of CONTENT_TABLES) {
    await pool.query(`DELETE FROM ${table}`);
  }
};
