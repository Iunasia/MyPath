import { and, asc, eq, inArray, lt, sql } from 'drizzle-orm';
import db from '../db';
import { verificationAttachments, verificationRequests } from '../db/schema';

/** What clients see. `storage_key` stays server-side. */
export interface Attachment {
  id: number;
  mime: string;
  width: number;
  height: number;
  size_bytes: number;
  created_at: Date;
}

export interface StoredAttachment extends Attachment {
  request_id: number;
  storage_key: string;
}

export interface NewAttachment {
  storage_key: string;
  mime: string;
  width: number;
  height: number;
  size_bytes: number;
}

/** How long a screenshot is kept once its request has been answered. */
export const ATTACHMENT_RETENTION_DAYS = 90;

const publicColumns = {
  id: verificationAttachments.id,
  mime: verificationAttachments.mime,
  width: verificationAttachments.width,
  height: verificationAttachments.height,
  size_bytes: verificationAttachments.size_bytes,
  created_at: verificationAttachments.created_at
};

const VerificationAttachment = {
  /** Attachments for many requests in one query, keyed by request id. */
  listForRequests: async (requestIds: number[]): Promise<Map<number, Attachment[]>> => {
    const byRequest = new Map<number, Attachment[]>();
    if (requestIds.length === 0) return byRequest;

    const rows = await db
      .select({ request_id: verificationAttachments.request_id, ...publicColumns })
      .from(verificationAttachments)
      .where(inArray(verificationAttachments.request_id, requestIds))
      .orderBy(asc(verificationAttachments.id));

    for (const { request_id, ...attachment } of rows) {
      const list = byRequest.get(request_id) ?? [];
      list.push(attachment);
      byRequest.set(request_id, list);
    }
    return byRequest;
  },

  /** Scoped by request as well as id, so a guessed id cannot cross requests. */
  getForRequest: async (requestId: number, id: number): Promise<StoredAttachment | undefined> => {
    const [row] = await db
      .select()
      .from(verificationAttachments)
      .where(and(eq(verificationAttachments.id, id), eq(verificationAttachments.request_id, requestId)));
    return row;
  },

  /** Attachments on requests answered more than `days` ago. */
  listExpired: async (
    days = ATTACHMENT_RETENTION_DAYS,
    limit = 500
  ): Promise<Array<{ id: number; storage_key: string }>> =>
    db
      .select({ id: verificationAttachments.id, storage_key: verificationAttachments.storage_key })
      .from(verificationAttachments)
      .innerJoin(verificationRequests, eq(verificationRequests.id, verificationAttachments.request_id))
      .where(
        and(
          eq(verificationRequests.status, 'resolved'),
          lt(verificationRequests.reviewed_at, sql`now() - make_interval(days => ${days})`)
        )
      )
      .orderBy(asc(verificationAttachments.id))
      .limit(limit),

  deleteByIds: async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;
    await db.delete(verificationAttachments).where(inArray(verificationAttachments.id, ids));
  }
};

export default VerificationAttachment;
