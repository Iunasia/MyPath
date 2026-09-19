import pool from '../config/db';

export interface Campaign {
  id: number;
  title: string;
  tagline: string | null;
  trigger_param: string | null;
  type: 'image' | 'video';
  media_url: string;
  link_url: string;
  cta_text: string;
  countdown_seconds: number;
  is_active: boolean;
  priority: number;
  clicks: number;
  impressions: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCampaignInput {
  title: string;
  tagline?: string | null;
  trigger_param?: string | null;
  type?: 'image' | 'video';
  media_url: string;
  link_url: string;
  cta_text?: string;
  countdown_seconds?: number;
  is_active?: boolean;
  priority?: number;
}

export interface UpdateCampaignInput {
  title?: string;
  tagline?: string | null;
  trigger_param?: string | null;
  type?: 'image' | 'video';
  media_url?: string;
  link_url?: string;
  cta_text?: string;
  countdown_seconds?: number;
  is_active?: boolean;
  priority?: number;
}

export class CampaignModel {
  static async findAll(): Promise<Campaign[]> {
    const result = await pool.query(
      'SELECT * FROM campaigns ORDER BY priority DESC, id DESC'
    );
    return result.rows;
  }

  static async findActive(): Promise<Campaign[]> {
    const result = await pool.query(
      'SELECT * FROM campaigns WHERE is_active = TRUE ORDER BY priority DESC, id DESC'
    );
    return result.rows;
  }

  static async findById(id: number): Promise<Campaign | null> {
    const result = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(input: CreateCampaignInput): Promise<Campaign> {
    const {
      title,
      tagline = null,
      trigger_param = null,
      type = 'image',
      media_url,
      link_url,
      cta_text = 'Learn More',
      countdown_seconds = 3,
      is_active = true,
      priority = 0,
    } = input;

    const result = await pool.query(
      `INSERT INTO campaigns (
        title, tagline, trigger_param, type, media_url, link_url, cta_text, countdown_seconds, is_active, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        title.trim(),
        tagline?.trim() || null,
        trigger_param?.toLowerCase().trim() || null,
        type,
        media_url.trim(),
        link_url.trim(),
        cta_text.trim(),
        Math.max(0, Number(countdown_seconds) || 0),
        is_active,
        priority,
      ]
    );
    return result.rows[0];
  }

  static async update(id: number, input: UpdateCampaignInput): Promise<Campaign | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }
    if (input.tagline !== undefined) {
      fields.push(`tagline = $${idx++}`);
      values.push(input.tagline ? input.tagline.trim() : null);
    }
    if (input.trigger_param !== undefined) {
      fields.push(`trigger_param = $${idx++}`);
      values.push(input.trigger_param ? input.trigger_param.toLowerCase().trim() : null);
    }
    if (input.type !== undefined) {
      fields.push(`type = $${idx++}`);
      values.push(input.type);
    }
    if (input.media_url !== undefined) {
      fields.push(`media_url = $${idx++}`);
      values.push(input.media_url.trim());
    }
    if (input.link_url !== undefined) {
      fields.push(`link_url = $${idx++}`);
      values.push(input.link_url.trim());
    }
    if (input.cta_text !== undefined) {
      fields.push(`cta_text = $${idx++}`);
      values.push(input.cta_text.trim());
    }
    if (input.countdown_seconds !== undefined) {
      fields.push(`countdown_seconds = $${idx++}`);
      values.push(Math.max(0, Number(input.countdown_seconds) || 0));
    }
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(input.is_active);
    }
    if (input.priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(input.priority);
    }

    if (fields.length === 0) {
      return CampaignModel.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE campaigns
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async track(id: number, metric: 'click' | 'impression'): Promise<void> {
    const column = metric === 'click' ? 'clicks' : 'impressions';
    await pool.query(
      `UPDATE campaigns SET ${column} = ${column} + 1 WHERE id = $1`,
      [id]
    );
  }
}

export default CampaignModel;
