import pool from '../config/db';

/** The four things a student can save. */
export const SAVED_ITEM_TYPES = ['scholarship', 'major', 'career', 'university'] as const;
export type SavedItemType = (typeof SAVED_ITEM_TYPES)[number];

export const isSavedItemType = (value: unknown): value is SavedItemType =>
  typeof value === 'string' && (SAVED_ITEM_TYPES as readonly string[]).includes(value);

/** Which table each type points at — also the existence check before saving. */
const TABLE_FOR: Record<SavedItemType, string> = {
  scholarship: 'scholarships',
  major: 'majors',
  career: 'careers',
  university: 'universities'
};

export interface SavedItem {
  user_id: number;
  item_type: SavedItemType;
  item_id: number;
  saved_at: Date;
}

/** A saved row joined with enough of the target to render a card. */
export interface SavedItemDetail extends SavedItem {
  title: string;
  subtitle: string | null;
  image: string | null;
}

const SavedItem = {
  /** True when the referenced record actually exists. */
  targetExists: async (type: SavedItemType, id: number): Promise<boolean> => {
    const res = await pool.query(`SELECT 1 FROM ${TABLE_FOR[type]} WHERE id = $1`, [id]);
    return res.rowCount === 1;
  },

  save: async (userId: number, type: SavedItemType, itemId: number): Promise<void> => {
    await pool.query(
      `INSERT INTO saved_items (user_id, item_type, item_id)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [userId, type, itemId]
    );
  },

  remove: async (userId: number, type: SavedItemType, itemId: number): Promise<boolean> => {
    const res = await pool.query(
      'DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
      [userId, type, itemId]
    );
    return (res.rowCount ?? 0) > 0;
  },

  /**
   * Everything a user saved, newest first, with a display title pulled from the
   * right table. One query per type keeps each projection readable — a single
   * UNION would need every table to expose identically named columns.
   */
  listForUser: async (userId: number): Promise<SavedItemDetail[]> => {
    const projections: Record<SavedItemType, string> = {
      scholarship: `SELECT s.id AS item_id, s.title, s.provider AS subtitle, s.image_url AS image
                    FROM scholarships s JOIN saved_items si ON si.item_id = s.id
                    WHERE si.user_id = $1 AND si.item_type = 'scholarship'`,
      major: `SELECT m.id AS item_id, m.name AS title, m.field AS subtitle, NULL AS image
              FROM majors m JOIN saved_items si ON si.item_id = m.id
              WHERE si.user_id = $1 AND si.item_type = 'major'`,
      career: `SELECT c.id AS item_id, c.title, c.category AS subtitle, NULL AS image
               FROM careers c JOIN saved_items si ON si.item_id = c.id
               WHERE si.user_id = $1 AND si.item_type = 'career'`,
      university: `SELECT u.id AS item_id, u.name AS title, u.city AS subtitle, u.image_url AS image
                   FROM universities u JOIN saved_items si ON si.item_id = u.id
                   WHERE si.user_id = $1 AND si.item_type = 'university'`
    };

    const savedAt = await pool.query(
      'SELECT item_type, item_id, saved_at FROM saved_items WHERE user_id = $1',
      [userId]
    );
    const when = new Map(
      savedAt.rows.map((r: any) => [`${r.item_type}:${r.item_id}`, r.saved_at as Date])
    );

    const items: SavedItemDetail[] = [];
    for (const type of SAVED_ITEM_TYPES) {
      const res = await pool.query(projections[type], [userId]);
      for (const row of res.rows) {
        items.push({
          user_id: userId,
          item_type: type,
          item_id: row.item_id,
          title: row.title,
          subtitle: row.subtitle,
          image: row.image,
          saved_at: when.get(`${type}:${row.item_id}`) as Date
        });
      }
    }

    return items.sort((a, b) => b.saved_at.getTime() - a.saved_at.getTime());
  }
};

export default SavedItem;
