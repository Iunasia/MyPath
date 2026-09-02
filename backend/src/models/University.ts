import pool from '../config/db';

// Define the shape of your University data
interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  ranking: number; // Or string, depending on your DB
  description: string;
  website: string;
  tuition_range: string;
  acceptance_rate: string; // Or number, depending on your DB
  programs: string[];
  source: string;
  source_url: string;
}

const University = {
  getAll: async (): Promise<University[]> => {
    const res = await pool.query('SELECT * FROM universities ORDER BY name ASC');
    return res.rows as University[];
  },

  getById: async (id: number): Promise<University | undefined> => {
    const res = await pool.query('SELECT * FROM universities WHERE id = $1', [id]);
    return res.rows[0] as University | undefined;
  },

  create: async (data: Omit<University, 'id'>): Promise<University> => {
    const res = await pool.query(
      `INSERT INTO universities (name, country, city, ranking, description, website, tuition_range, acceptance_rate, programs, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [data.name, data.country, data.city, data.ranking, data.description, data.website, data.tuition_range, data.acceptance_rate, data.programs, data.source, data.source_url]
    );
    return res.rows[0] as University;
  }
};

export default University;