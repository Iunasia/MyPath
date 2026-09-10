import pool from '../config/db';

// Define the shape of your Major data
interface Major {
  id: number;
  name: string;
  field: string;
  description: string;
  /** Not supplied by the current source sheet. */
  duration: string | null;
  degree_type: string | null;
  subjects: string[];
  personality_fit: string | null;
  job_market_demand: string | null;
  related_careers: string[];
  /** Universities in the source sheet that offer this major. */
  universities: string[];
  related_scholarships: string[];
  source: string | null;
  source_url: string | null;
}

const Major = {
  getAll: async (): Promise<Major[]> => {
    const res = await pool.query('SELECT * FROM majors ORDER BY field ASC, name ASC');
    return res.rows as Major[];
  },

  getById: async (id: number): Promise<Major | undefined> => {
    const res = await pool.query('SELECT * FROM majors WHERE id = $1', [id]);
    return res.rows[0] as Major | undefined;
  },

  create: async (data: Omit<Major, 'id'>): Promise<Major> => {
    const res = await pool.query(
      `INSERT INTO majors (name, field, description, duration, degree_type, subjects, personality_fit, job_market_demand, related_careers, universities, related_scholarships, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        data.name,
        data.field,
        data.description,
        data.duration ?? null,
        data.degree_type ?? null,
        data.subjects ?? [],
        data.personality_fit ?? null,
        data.job_market_demand ?? null,
        data.related_careers ?? [],
        data.universities ?? [],
        data.related_scholarships ?? [],
        data.source ?? null,
        data.source_url ?? null
      ]
    );
    return res.rows[0] as Major;
  }
};

export default Major;
