import pool from '../config/db';

// Define the shape of your University data
interface University {
  id: number;
  /** Stable slug from the frontend dataset, e.g. "cadt" — used in URLs. */
  slug: string | null;
  name: string;
  short_name: string | null;
  country: string;
  city: string;
  /** 'Public' | 'Private' | 'International' */
  type: string | null;
  /** Not supplied by the current dataset. */
  ranking: number | null;
  description: string;
  website: string;
  phone: string | null;
  established: string | null;
  student_count: string | null;
  image_url: string | null;
  tuition_range: string | null;
  acceptance_rate: string | null;
  programs: string[];
  scholarships: string[];
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

  /** Lookup by the frontend's slug, so /universities/cadt keeps working. */
  getBySlug: async (slug: string): Promise<University | undefined> => {
    const res = await pool.query('SELECT * FROM universities WHERE slug = $1', [slug]);
    return res.rows[0] as University | undefined;
  },

  create: async (data: Omit<University, 'id'>): Promise<University> => {
    const res = await pool.query(
      `INSERT INTO universities (slug, name, short_name, country, city, type, ranking, description, website, phone, established, student_count, image_url, tuition_range, acceptance_rate, programs, scholarships, source, source_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [
        data.slug ?? null,
        data.name,
        data.short_name ?? null,
        data.country,
        data.city,
        data.type ?? null,
        data.ranking ?? null,
        data.description,
        data.website,
        data.phone ?? null,
        data.established ?? null,
        data.student_count ?? null,
        data.image_url ?? null,
        data.tuition_range ?? null,
        data.acceptance_rate ?? null,
        data.programs ?? [],
        data.scholarships ?? [],
        data.source,
        data.source_url
      ]
    );
    return res.rows[0] as University;
  }
};

export default University;
