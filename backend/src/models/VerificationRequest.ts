import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import db from '../db';
import { users, verificationAttachments, verificationRequests } from '../db/schema';
import type { NewAttachment } from './VerificationAttachment';
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
  /** Screenshots already written to storage; their rows are inserted with the request. */
  attachments?: NewAttachment[];
}

/** Queue page size when the caller does not ask for one, and the ceiling it may ask for. */
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

/**
 * `users` is joined twice — once for who asked, once for who reviewed — so each
 * join needs its own alias, exactly as the raw SQL used `u` and `a`. Both are
 * LEFT joins because either side may be null: accounts are ON DELETE SET NULL,
 * and an unreviewed request has no reviewer.
 *
 * Selecting the request's columns individually rather than as a nested object
 * keeps the result flat, so rows come back in the shape the routes already
 * expect with no post-processing.
 */
const submitter = alias(users, 'submitter');
const reviewer = alias(users, 'reviewer');

const withUser = () =>
  db
    .select({
      id: verificationRequests.id,
      user_id: verificationRequests.user_id,
      scholarship_id: verificationRequests.scholarship_id,
      submitted_url: verificationRequests.submitted_url,
      submitted_title: verificationRequests.submitted_title,
      note: verificationRequests.note,
      auto_check: verificationRequests.auto_check,
      status: verificationRequests.status,
      verdict: verificationRequests.verdict,
      admin_response: verificationRequests.admin_response,
      reviewed_by: verificationRequests.reviewed_by,
      reviewed_at: verificationRequests.reviewed_at,
      read_by_user: verificationRequests.read_by_user,
      created_at: verificationRequests.created_at,
      submitted_by_name: submitter.name,
      submitted_by_email: submitter.email,
      reviewed_by_name: reviewer.name
    })
    .from(verificationRequests)
    .leftJoin(submitter, eq(submitter.id, verificationRequests.user_id))
    .leftJoin(reviewer, eq(reviewer.id, verificationRequests.reviewed_by));

/** Pending first, then reviewing, then everything else — the queue's priority. */
const statusRank = sql`CASE ${verificationRequests.status}
                         WHEN 'pending' THEN 0
                         WHEN 'reviewing' THEN 1
                         ELSE 2
                       END`;

const VerificationRequest = {
  create: async (data: CreateInput): Promise<VerificationRequest> =>
    // One transaction, so a request never exists with half its attachments.
    db.transaction(async tx => {
      const [row] = await tx
        .insert(verificationRequests)
        .values({
          user_id: data.user_id,
          scholarship_id: data.scholarship_id,
          submitted_url: data.submitted_url,
          submitted_title: data.submitted_title,
          note: data.note,
          // Passed as an object, not JSON.stringify'd as the raw version did:
          // Drizzle serialises jsonb itself, and pre-stringifying would store a
          // JSON string *containing* JSON rather than the object.
          auto_check: data.auto_check
        })
        .returning();

      if (data.attachments?.length) {
        await tx
          .insert(verificationAttachments)
          .values(data.attachments.map(a => ({ ...a, request_id: row.id })));
      }

      return row as VerificationRequest;
    }),

  getById: async (id: number): Promise<VerificationRequestWithUser | undefined> => {
    const rows = await withUser().where(eq(verificationRequests.id, id));
    return rows[0] as VerificationRequestWithUser | undefined;
  },

  /** One student's own requests — their inbox. Newest first. */
  listForUser: async (userId: number): Promise<VerificationRequestWithUser[]> => {
    const rows = await withUser()
      .where(eq(verificationRequests.user_id, userId))
      .orderBy(desc(verificationRequests.created_at));

    return rows as VerificationRequestWithUser[];
  },

  /**
   * The review queue. Pending first, then oldest first within a status.
   *
   * Paged, because this used to load every request ever filed on each view.
   * Offset paging rather than keyset: the unfiltered ordering sorts on a CASE
   * expression, so a keyset cursor would have to carry that derived rank, and
   * an admin queue is browsed from the front rather than paged deeply. Revisit
   * if anyone ever pages far into `resolved`.
   */
  listAll: async (
    status?: RequestStatus,
    page: { limit?: number; offset?: number } = {}
  ): Promise<VerificationRequestWithUser[]> => {
    const limit = page.limit ?? DEFAULT_PAGE_SIZE;
    const offset = page.offset ?? 0;

    const query = status
      ? withUser()
          .where(eq(verificationRequests.status, status))
          .orderBy(asc(verificationRequests.created_at))
      : withUser().orderBy(statusRank, asc(verificationRequests.created_at));

    const rows = await query.limit(limit).offset(offset);
    return rows as VerificationRequestWithUser[];
  },

  /** How many answered requests the student has not opened yet. */
  unreadCount: async (userId: number): Promise<number> => {
    const [row] = await db
      .select({ count: sql<string>`count(*)` })
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.user_id, userId),
          eq(verificationRequests.status, 'resolved'),
          eq(verificationRequests.read_by_user, false)
        )
      );

    return Number(row.count);
  },

  markRead: async (id: number, userId: number): Promise<void> => {
    await db
      .update(verificationRequests)
      .set({ read_by_user: true })
      // Scoped by user as well as id, so one student can never clear another's badge.
      .where(and(eq(verificationRequests.id, id), eq(verificationRequests.user_id, userId)));
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

    const updated = await db
      .update(verificationRequests)
      .set({
        status: data.status,
        verdict: data.verdict,
        admin_response: data.admin_response,
        reviewed_by: reviewerId,
        // Only a resolution stamps the time and relights the unread badge; the
        // raw version expressed this as a SQL CASE, but leaving the keys out
        // entirely is the same thing and reads better. `now()` rather than a JS
        // Date so the timestamp still comes from the database clock.
        ...(resolved ? { reviewed_at: sql`now()`, read_by_user: false } : {})
      })
      .where(eq(verificationRequests.id, id))
      .returning({ id: verificationRequests.id });

    if (updated.length === 0) return undefined;
    return VerificationRequest.getById(id);
  }
};

export default VerificationRequest;
