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
  archived_at: Date | null;
  archived_by: number | null;
  edited_at: Date | null;
  edited_by: number | null;
}

/** Server-managed columns an admin must never set through a write endpoint. */
type Writable = Omit<Major, 'id' | 'archived_at' | 'archived_by' | 'edited_at' | 'edited_by'>;

const Major = {
  getAll: async (options: { includeArchived?: boolean } = {}): Promise<Major[]> => {
    const where = options.includeArchived ? '' : 'WHERE archived_at IS NULL';
    const res = await pool.query(`SELECT * FROM majors ${where} ORDER BY field ASC, name ASC`);
    return res.rows as Major[];
  },

  getById: async (id: number): Promise<Major | undefined> => {
    const res = await pool.query('SELECT * FROM majors WHERE id = $1', [id]);
    return res.rows[0] as Major | undefined;
  },

  create: async (data: Writable, actorId: number | null = null): Promise<Major> => {
    const res = await pool.query(
      `INSERT INTO majors (name, field, description, duration, degree_type, subjects, personality_fit, job_market_demand, related_careers, universities, related_scholarships, source, source_url, edited_at, edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14) RETURNING *`,
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
        data.source_url ?? null,
        actorId
      ]
    );
    return res.rows[0] as Major;
  },

  update: async (
    id: number,
    fields: Record<string, unknown>,
    actorId: number | null
  ): Promise<Major | undefined> => {
    const columns = Object.keys(fields);
    const values: unknown[] = columns.map(column => fields[column]);
    const sets = columns.map((column, i) => `${column} = $${i + 1}`);

    values.push(actorId);
    const actorIndex = values.length;
    values.push(id);
    const idIndex = values.length;

    sets.push('edited_at = NOW()', `edited_by = $${actorIndex}`);

    const res = await pool.query(
      `UPDATE majors SET ${sets.join(', ')} WHERE id = $${idIndex} RETURNING *`,
      values
    );
    return res.rows[0] as Major | undefined;
  },

  archive: async (id: number, actorId: number | null): Promise<Major | undefined> => {
    const res = await pool.query(
      `UPDATE majors
       SET archived_at = COALESCE(archived_at, NOW()),
           archived_by = COALESCE(archived_by, $2)
       WHERE id = $1 RETURNING *`,
      [id, actorId]
    );
    return res.rows[0] as Major | undefined;
  },

  restore: async (id: number): Promise<Major | undefined> => {
    const res = await pool.query(
      'UPDATE majors SET archived_at = NULL, archived_by = NULL WHERE id = $1 RETURNING *',
      [id]
    );
    return res.rows[0] as Major | undefined;
  }
};

export default Major;
