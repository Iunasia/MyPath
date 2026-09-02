import pool from '../config/db';

// Define the shape of your Career data
interface Career {
  id: number;
  title: string;
  category: string;
  description: string;
  average_salary: string;
  growth_outlook: string;
  required_skills: string[];
  related_majors: string[];
  source: string;
  source_url: string;
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
      `INSERT INTO careers (title, category, description, average_salary, growth_outlook, required_skills, related_majors, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.title, data.category, data.description, data.average_salary, data.growth_outlook, data.required_skills, data.related_majors, data.source, data.source_url]
    );
    return res.rows[0] as Career;
  }
};

export default Career;
