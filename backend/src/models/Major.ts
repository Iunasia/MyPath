import pool from '../config/db';

// Define the shape of your Major data
interface Major {
  id: number;
  name: string;
  field: string;
  description: string;
  duration: string;
  degree_type: string;
  related_careers: string[];
  source: string;
  source_url: string;
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
      `INSERT INTO majors (name, field, description, duration, degree_type, related_careers, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.name, data.field, data.description, data.duration, data.degree_type, data.related_careers, data.source, data.source_url]
    );
    return res.rows[0] as Major;
  }
};

export default Major;