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
  deadline: Date;
  application_link: string;
  country: string;
  source: string;
  source_url: string;
  source_type: string;
  verified_status: string;
  safety_warnings: string[];
}

// Interface for the joined query in getSavedByUser
interface SavedScholarship extends Scholarship {
  saved_at: Date;
}

// Interface for the saved_opportunities table
interface SavedOpportunity {
  user_id: number;
  scholarship_id: number;
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
    const res = await pool.query('SELECT * FROM scholarships ORDER BY deadline ASC NULLS LAST');
    return res.rows as Scholarship[];
  },

  getById: async (id: number): Promise<Scholarship | undefined> => {
    const res = await pool.query('SELECT * FROM scholarships WHERE id = $1', [id]);
    return res.rows[0] as Scholarship | undefined;
  },

  create: async (data: Omit<Scholarship, 'id'>): Promise<Scholarship> => {
    const res = await pool.query(
      `INSERT INTO scholarships (title, provider, provider_type, description, amount, coverage, eligibility, deadline, application_link, country, source, source_url, source_type, verified_status, safety_warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [data.title, data.provider, data.provider_type, data.description, data.amount, data.coverage, data.eligibility, data.deadline, data.application_link, data.country, data.source, data.source_url, data.source_type, data.verified_status, data.safety_warnings]
    );
    return res.rows[0] as Scholarship;
  },

  // Save opportunity for student
  saveForUser: async (userId: number, scholarshipId: number): Promise<SavedOpportunity | undefined> => {
    const res = await pool.query(
      'INSERT INTO saved_opportunities (user_id, scholarship_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, scholarshipId]
    );
    return res.rows[0] as SavedOpportunity | undefined;
  },

  // Get all saved opportunities for a student
  getSavedByUser: async (userId: number): Promise<SavedScholarship[]> => {
    const res = await pool.query(
      `SELECT s.*, so.saved_at 
       FROM scholarships s
       JOIN saved_opportunities so ON s.id = so.scholarship_id
       WHERE so.user_id = $1
       ORDER BY so.saved_at DESC`,
      [userId]
    );
    return res.rows as SavedScholarship[];
  },

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