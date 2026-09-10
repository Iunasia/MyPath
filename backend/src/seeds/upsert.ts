import type { Pool } from 'pg';
import { CONTENT_TABLES, NATURAL_KEY } from './schema';

/**
 * Non-destructive loading of spreadsheet content.
 *
 * The old seed truncated every table, which deleted user accounts and — worse —
 * reset the id sequences, so a student's saved scholarship silently came to
 * point at a different one. Upserting on a natural key keeps ids stable, leaves
 * user-generated data alone, and still removes rows deleted from the sheet.
 */

export interface UpsertSummary {
  table: string;
  inserted: number;
  updated: number;
  deleted: number;
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
 * Insert-or-update every row, then delete records whose natural key no longer
 * appears in the sheet. `xmax = 0` is Postgres's way of saying "this row was
 * inserted, not updated", which is how the counts are split.
 */
export const upsertTable = async (
  pool: Pool,
  table: ContentTable,
  rows: Row[]
): Promise<UpsertSummary> => {
  const key = NATURAL_KEY[table];
  const summary: UpsertSummary = { table, inserted: 0, updated: 0, deleted: 0 };

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
