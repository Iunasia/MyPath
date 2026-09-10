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
  last_verified: Date | null;
  safety_warnings: string[];
}

// Interface for the reports table
interface Report {
  id: number;
  user_id: number;
  scholarship_id: number;
  reason: string;
}

const Scholarship = {
  // Get all verified scholarships
  getAll: async (): Promise<Scholarship[]> => {
    // Most imported rows have prose deadlines rather than dates, so fall back
    // to title to keep the ordering stable rather than arbitrary.
    const res = await pool.query('SELECT * FROM scholarships ORDER BY deadline ASC NULLS LAST, title ASC');
    return res.rows as Scholarship[];
  },

  getById: async (id: number): Promise<Scholarship | undefined> => {
    const res = await pool.query('SELECT * FROM scholarships WHERE id = $1', [id]);
    return res.rows[0] as Scholarship | undefined;
  },

  /** Several at once, for Compare. Row order is not guaranteed — callers reorder. */
  getByIds: async (ids: number[]): Promise<Scholarship[]> => {
    const res = await pool.query('SELECT * FROM scholarships WHERE id = ANY($1::int[])', [ids]);
    return res.rows as Scholarship[];
  },

  create: async (data: Omit<Scholarship, 'id'>): Promise<Scholarship> => {
    const res = await pool.query(
      `INSERT INTO scholarships (title, provider, provider_type, description, amount, coverage, eligibility, degree_level, field_of_study, documents, application_process, deadline, deadline_note, application_link, image_url, country, opportunity_type, source, source_url, source_type, verified_status, last_verified, safety_warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) RETURNING *`,
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
        data.safety_warnings ?? []
      ]
    );
    return res.rows[0] as Scholarship;
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