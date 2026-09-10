import pool from '../config/db';
import type { LinkCheck } from '../utils/linkCheck';

export const REQUEST_STATUSES = ['pending', 'reviewing', 'resolved'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const VERDICTS = ['legitimate', 'scam', 'outdated', 'unverifiable'] as const;
export type Verdict = (typeof VERDICTS)[number];

export const isStatus = (v: unknown): v is RequestStatus =>
  typeof v === 'string' && (REQUEST_STATUSES as readonly string[]).includes(v);

export const isVerdict = (v: unknown): v is Verdict =>
  typeof v === 'string' && (VERDICTS as readonly string[]).includes(v);

export interface VerificationRequest {
  id: number;
  user_id: number | null;
  scholarship_id: number | null;
  submitted_url: string | null;
  submitted_title: string;
  note: string | null;
  auto_check: LinkCheck | null;
  status: RequestStatus;
  verdict: Verdict | null;
  admin_response: string | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  read_by_user: boolean;
  created_at: Date;
}

/** The queue view also carries who asked, for the admin list. */
export interface VerificationRequestWithUser extends VerificationRequest {
  submitted_by_name: string | null;
  submitted_by_email: string | null;
  reviewed_by_name: string | null;
}

export interface CreateInput {
  user_id: number;
  scholarship_id: number | null;
  submitted_url: string | null;
  submitted_title: string;
  note: string | null;
  auto_check: LinkCheck;
}

const WITH_USER = `
  SELECT r.*,
         u.name  AS submitted_by_name,
         u.email AS submitted_by_email,
         a.name  AS reviewed_by_name
  FROM verification_requests r
  LEFT JOIN users u ON u.id = r.user_id
  LEFT JOIN users a ON a.id = r.reviewed_by
`;

const VerificationRequest = {
  create: async (data: CreateInput): Promise<VerificationRequest> => {
    const res = await pool.query(
      `INSERT INTO verification_requests
         (user_id, scholarship_id, submitted_url, submitted_title, note, auto_check)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        data.user_id,
        data.scholarship_id,
        data.submitted_url,
        data.submitted_title,
        data.note,
        JSON.stringify(data.auto_check)
      ]
    );
    return res.rows[0] as VerificationRequest;
  },

  getById: async (id: number): Promise<VerificationRequestWithUser | undefined> => {
    const res = await pool.query(`${WITH_USER} WHERE r.id = $1`, [id]);
    return res.rows[0] as VerificationRequestWithUser | undefined;
  },

  /** One student's own requests — their inbox. Newest first. */
  listForUser: async (userId: number): Promise<VerificationRequestWithUser[]> => {
    const res = await pool.query(
      `${WITH_USER} WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
      [userId]
    );
    return res.rows as VerificationRequestWithUser[];
  },

  /** The review queue. Pending first, then oldest first within a status. */
  listAll: async (status?: RequestStatus): Promise<VerificationRequestWithUser[]> => {
    const res = status
      ? await pool.query(
          `${WITH_USER} WHERE r.status = $1
           ORDER BY r.created_at ASC`,
          [status]
        )
      : await pool.query(
          `${WITH_USER}
           ORDER BY CASE r.status
                      WHEN 'pending' THEN 0
                      WHEN 'reviewing' THEN 1
                      ELSE 2
                    END,
                    r.created_at ASC`
        );
    return res.rows as VerificationRequestWithUser[];
  },

  /** How many answered requests the student has not opened yet. */
  unreadCount: async (userId: number): Promise<number> => {
    const res = await pool.query(
      `SELECT count(*) FROM verification_requests
       WHERE user_id = $1 AND status = 'resolved' AND read_by_user = FALSE`,
      [userId]
    );
    return Number(res.rows[0].count);
  },

  markRead: async (id: number, userId: number): Promise<void> => {
    await pool.query(
      'UPDATE verification_requests SET read_by_user = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  },

  /**
   * Records a reviewer's decision. Resolving stamps who and when, and clears
   * the read flag so the answer shows as new in the student's inbox.
   */
  review: async (
    id: number,
    reviewerId: number,
    data: { status: RequestStatus; verdict: Verdict | null; admin_response: string | null }
  ): Promise<VerificationRequestWithUser | undefined> => {
    const resolved = data.status === 'resolved';
    const res = await pool.query(
      `UPDATE verification_requests
       SET status = $1,
           verdict = $2,
           admin_response = $3,
           reviewed_by = $4,
           reviewed_at = CASE WHEN $5::boolean THEN NOW() ELSE reviewed_at END,
           read_by_user = CASE WHEN $5::boolean THEN FALSE ELSE read_by_user END
       WHERE id = $6
       RETURNING id`,
      [data.status, data.verdict, data.admin_response, reviewerId, resolved, id]
    );
    if (res.rowCount === 0) return undefined;
    return VerificationRequest.getById(id);
  }
};

export default VerificationRequest;
