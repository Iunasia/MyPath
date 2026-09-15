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
  archived_at: Date | null;
  archived_by: number | null;
  edited_at: Date | null;
  edited_by: number | null;
}

/** Server-managed columns an admin must never set through a write endpoint. */
type Writable = Omit<University, 'id' | 'archived_at' | 'archived_by' | 'edited_at' | 'edited_by'>;

const University = {
  getAll: async (options: { includeArchived?: boolean } = {}): Promise<University[]> => {
    const where = options.includeArchived ? '' : 'WHERE archived_at IS NULL';
    const res = await pool.query(`SELECT * FROM universities ${where} ORDER BY name ASC`);
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

  create: async (data: Writable, actorId: number | null = null): Promise<University> => {
    const res = await pool.query(
      `INSERT INTO universities (slug, name, short_name, country, city, type, ranking, description, website, phone, established, student_count, image_url, tuition_range, acceptance_rate, programs, scholarships, source, source_url, edited_at, edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), $20) RETURNING *`,
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
        data.source_url,
        actorId
      ]
    );
    return res.rows[0] as University;
  },

  update: async (
    id: number,
    fields: Record<string, unknown>,
    actorId: number | null
  ): Promise<University | undefined> => {
    const columns = Object.keys(fields);
    const values: unknown[] = columns.map(column => fields[column]);
    const sets = columns.map((column, i) => `${column} = $${i + 1}`);

    values.push(actorId);
    const actorIndex = values.length;
    values.push(id);
    const idIndex = values.length;

    sets.push('edited_at = NOW()', `edited_by = $${actorIndex}`);

    const res = await pool.query(
      `UPDATE universities SET ${sets.join(', ')} WHERE id = $${idIndex} RETURNING *`,
      values
    );
    return res.rows[0] as University | undefined;
  },

  archive: async (id: number, actorId: number | null): Promise<University | undefined> => {
    const res = await pool.query(
      `UPDATE universities
       SET archived_at = COALESCE(archived_at, NOW()),
           archived_by = COALESCE(archived_by, $2)
       WHERE id = $1 RETURNING *`,
      [id, actorId]
    );
    return res.rows[0] as University | undefined;
  },

  restore: async (id: number): Promise<University | undefined> => {
    const res = await pool.query(
      'UPDATE universities SET archived_at = NULL, archived_by = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0] as University | undefined;
  }
};

export default University;
