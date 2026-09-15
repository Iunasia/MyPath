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
  archived_at: Date | null;
  archived_by: number | null;
  edited_at: Date | null;
  edited_by: number | null;
}

/** Server-managed columns an admin must never set through a write endpoint. */
type Writable = Omit<Career, 'id' | 'archived_at' | 'archived_by' | 'edited_at' | 'edited_by'>;

const Career = {
  getAll: async (options: { includeArchived?: boolean } = {}): Promise<Career[]> => {
    const where = options.includeArchived ? '' : 'WHERE archived_at IS NULL';
    const res = await pool.query(`SELECT * FROM careers ${where} ORDER BY category ASC, title ASC`);
    return res.rows as Career[];
  },

  getById: async (id: number): Promise<Career | undefined> => {
    const res = await pool.query('SELECT * FROM careers WHERE id = $1', [id]);
    return res.rows[0] as Career | undefined;
  },

  create: async (data: Writable, actorId: number | null = null): Promise<Career> => {
    const res = await pool.query(
      `INSERT INTO careers (title, category, description, responsibilities, average_salary, growth_outlook, education_required, personality_fit, required_skills, related_majors, source, source_url, edited_at, edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13) RETURNING *`,
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
        data.source_url ?? null,
        actorId
      ]
    );
    return res.rows[0] as Career;
  },

  /** Apply a validated, whitelisted set of column changes. */
  update: async (
    id: number,
    fields: Record<string, unknown>,
    actorId: number | null
  ): Promise<Career | undefined> => {
    const columns = Object.keys(fields);
    const values: unknown[] = columns.map(column => fields[column]);
    const sets = columns.map((column, i) => `${column} = $${i + 1}`);

    values.push(actorId);
    const actorIndex = values.length;
    values.push(id);
    const idIndex = values.length;

    sets.push('edited_at = NOW()', `edited_by = $${actorIndex}`);

    const res = await pool.query(
      `UPDATE careers SET ${sets.join(', ')} WHERE id = $${idIndex} RETURNING *`,
      values
    );
    return res.rows[0] as Career | undefined;
  },

  archive: async (id: number, actorId: number | null): Promise<Career | undefined> => {
    const res = await pool.query(
      `UPDATE careers
       SET archived_at = COALESCE(archived_at, NOW()),
           archived_by = COALESCE(archived_by, $2)
       WHERE id = $1 RETURNING *`,
      [id, actorId]
    );
    return res.rows[0] as Career | undefined;
  },

  restore: async (id: number): Promise<Career | undefined> => {
    const res = await pool.query(
      'UPDATE careers SET archived_at = NULL, archived_by = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0] as Career | undefined;
  }
};

export default Career;
