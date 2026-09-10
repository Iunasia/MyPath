import pool from '../config/db';

// Define the shape of your Career data
interface Career {
  id: number;
  title: string;
  category: string;
  description: string;
  /** One-line summary of the day-to-day work. */
  responsibilities: string | null;
  /** Not supplied by the current source sheet. */
  average_salary: string | null;
  growth_outlook: string | null;
  education_required: string | null;
  personality_fit: string | null;
  required_skills: string[];
  related_majors: string[];
  source: string | null;
  source_url: string | null;
}

const Career = {
  getAll: async (): Promise<Career[]> => {
    const res = await pool.query('SELECT * FROM careers ORDER BY category ASC, title ASC');
    return res.rows as Career[];
  },

  getById: async (id: number): Promise<Career | undefined> => {
    const res = await pool.query('SELECT * FROM careers WHERE id = $1', [id]);
    return res.rows[0] as Career | undefined;
  },

  create: async (data: Omit<Career, 'id'>): Promise<Career> => {
    const res = await pool.query(
      `INSERT INTO careers (title, category, description, responsibilities, average_salary, growth_outlook, education_required, personality_fit, required_skills, related_majors, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        data.title,
        data.category,
        data.description,
        data.responsibilities ?? null,
        data.average_salary ?? null,
        data.growth_outlook ?? null,
        data.education_required ?? null,
        data.personality_fit ?? null,
        data.required_skills ?? [],
        data.related_majors ?? [],
        data.source ?? null,
        data.source_url ?? null
      ]
    );
    return res.rows[0] as Career;
  }
};

export default Career;
