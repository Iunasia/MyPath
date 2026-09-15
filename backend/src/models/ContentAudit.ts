import pool from '../config/db';

export const AUDIT_ACTIONS = ['create', 'update', 'archive', 'restore'] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface ContentAuditEntry {
  id: number;
  entity: string;
  row_id: number;
  action: AuditAction;
  actor_id: number | null;
  /** For `update`, only the fields that actually changed: `{ field: { from, to } }`. */
  changes: Record<string, unknown>;
  reason: string | null;
  created_at: Date;
  actor_name?: string | null;
}

export interface RecordInput {
  entity: string;
  row_id: number;
  action: AuditAction;
  actor_id: number | null;
  changes?: Record<string, unknown>;
  reason?: string | null;
}

/**
 * The change log for catalogue content. Every admin write records one row, so
 * a value that looks wrong six months later can be traced to who set it and why.
 */
const ContentAudit = {
  record: async (input: RecordInput): Promise<void> => {
    await pool.query(
      `INSERT INTO content_audit (entity, row_id, action, actor_id, changes, reason)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.entity,
        input.row_id,
        input.action,
        input.actor_id,
        JSON.stringify(input.changes ?? {}),
        input.reason ?? null
      ]
    );
  },

  listFor: async (entity: string, rowId: number): Promise<ContentAuditEntry[]> => {
    const res = await pool.query(
      `SELECT a.*, u.name AS actor_name
       FROM content_audit a
       LEFT JOIN users u ON u.id = a.actor_id
       WHERE a.entity = $1 AND a.row_id = $2
       ORDER BY a.created_at DESC, a.id DESC`,
      [entity, rowId]
    );
    return res.rows as ContentAuditEntry[];
  }
};

export default ContentAudit;
