import pool from '../config/db';

// Define the shape of your Scholarship data
interface Scholarship {
  id: number;
  title: string;
  provider: string;
  provider_type: string;
  description: string;
  amount: string;
  coverage: string;
  eligibility: string;
  degree_level: string | null;
  field_of_study: string | null;
  /** Documents the applicant must prepare. */
  documents: string[];
  application_process: string | null;
  deadline: Date | null;
  /** Verbatim deadline text when the source is prose ("Rolling", "Aug-Nov"). */
  deadline_note: string | null;
  application_link: string;
  image_url: string | null;
  country: string;
  /** 'scholarship' | 'exchange' | 'internship' */
  opportunity_type: string;
  source: string;
  source_url: string;
  source_type: string;
  verified_status: string;
  /** When a person last checked the listing against its source. */
  last_verified: Date | null;
  /** The admin who did that check. Set in the app, never by the sheets. */
  last_verified_by: number | null;
  safety_warnings: string[];
  /** Soft delete: hidden from students, still visible and restorable in admin. */
  archived_at: Date | null;
  archived_by: number | null;
  /** The admin who last changed any editable field, and when. */
  edited_at: Date | null;
  edited_by: number | null;
}

// Interface for the reports table
interface Report {
  id: number;
  user_id: number;
  scholarship_id: number;
  reason: string;
}

/**
 * Columns the create path writes. `last_verified` is allowed for internal
 * callers (the seed stamps it), but the admin routes never pass it — only
 * `POST /:id/verify` sets it, through `markVerified`.
 */
type Writable = Omit<
  Scholarship,
  'id' | 'last_verified_by' | 'archived_at' | 'archived_by' | 'edited_at' | 'edited_by'
>;

const Scholarship = {
  /**
   * Public listings. Archived rows are hidden unless an admin asks for them —
   * undated entries sort last so the ordering stays stable.
   */
  getAll: async (options: { includeArchived?: boolean } = {}): Promise<Scholarship[]> => {
    const where = options.includeArchived ? '' : 'WHERE archived_at IS NULL';
    const res = await pool.query(
      `SELECT * FROM scholarships ${where} ORDER BY deadline ASC NULLS LAST, title ASC`
    );
    return res.rows as Scholarship[];
  },

  getById: async (id: number): Promise<Scholarship | undefined> => {
    const res = await pool.query('SELECT * FROM scholarships WHERE id = $1', [id]);
    return res.rows[0] as Scholarship | undefined;
  },

  create: async (data: Writable, actorId: number | null = null): Promise<Scholarship> => {
    const res = await pool.query(
      `INSERT INTO scholarships (title, provider, provider_type, description, amount, coverage, eligibility, degree_level, field_of_study, documents, application_process, deadline, deadline_note, application_link, image_url, country, opportunity_type, source, source_url, source_type, verified_status, last_verified, safety_warnings, edited_at, edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), $24) RETURNING *`,
      [
        data.title,
        data.provider,
        data.provider_type,
        data.description,
        data.amount,
        data.coverage,
        data.eligibility,
        data.degree_level ?? null,
        data.field_of_study ?? null,
        data.documents ?? [],
        data.application_process ?? null,
        data.deadline,
        data.deadline_note ?? null,
        data.application_link,
        data.image_url ?? null,
        data.country,
        data.opportunity_type ?? 'scholarship',
        data.source,
        data.source_url,
        data.source_type,
        data.verified_status,
        data.last_verified ?? null,
        data.safety_warnings ?? [],
        actorId
      ]
    );
    return res.rows[0] as Scholarship;
  },

  /**
   * Apply a validated, whitelisted set of column changes. Always records who
   * made the change; the audit row is written by the caller.
   */
  update: async (
    id: number,
    fields: Record<string, unknown>,
    actorId: number | null
  ): Promise<Scholarship | undefined> => {
    const columns = Object.keys(fields);
    const values: unknown[] = columns.map(column => fields[column]);
    const sets = columns.map((column, i) => `${column} = $${i + 1}`);

    values.push(actorId);
    const actorIndex = values.length;
    values.push(id);
    const idIndex = values.length;

    sets.push('edited_at = NOW()', `edited_by = $${actorIndex}`);

    const res = await pool.query(
      `UPDATE scholarships SET ${sets.join(', ')} WHERE id = $${idIndex} RETURNING *`,
      values
    );
    return res.rows[0] as Scholarship | undefined;
  },

  /** Soft delete. Idempotent — archiving an archived row leaves the original stamp. */
  archive: async (id: number, actorId: number | null): Promise<Scholarship | undefined> => {
    const res = await pool.query(
      `UPDATE scholarships
       SET archived_at = COALESCE(archived_at, NOW()),
           archived_by = COALESCE(archived_by, $2)
       WHERE id = $1 RETURNING *`,
      [id, actorId]
    );
    return res.rows[0] as Scholarship | undefined;
  },

  restore: async (id: number): Promise<Scholarship | undefined> => {
    const res = await pool.query(
      'UPDATE scholarships SET archived_at = NULL, archived_by = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0] as Scholarship | undefined;
  },

  /**
   * A person confirmed the listing against the provider's own page. Stamps when
   * and who — students see the date as "Last verified" in the Information Check.
   */
  markVerified: async (id: number, userId: number): Promise<Scholarship | undefined> => {
    const res = await pool.query(
      'UPDATE scholarships SET last_verified = NOW(), last_verified_by = $2 WHERE id = $1 RETURNING *',
      [id, userId]
    );
    return res.rows[0] as Scholarship | undefined;
  },

  // Saving is handled by models/SavedItem.ts, which covers every item type.

  // Report outdated info
  report: async (userId: number, scholarshipId: number, reason: string): Promise<Report | undefined> => {
    const res = await pool.query(
      'INSERT INTO reports (user_id, scholarship_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [userId, scholarshipId, reason]
    );
    return res.rows[0] as Report | undefined;
  }
};

export default Scholarship;
