import crypto from 'crypto';
import { and, eq, gt, sql } from 'drizzle-orm';
import db from '../db';
import { emailVerifications } from '../db/schema';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

/** Codes and magic links both expire 15 minutes after they are issued. */
const TTL_MS = 15 * 60 * 1000;

const EmailVerification = {
  /**
   * Issues a code, and optionally a magic-link token that is equally valid.
   *
   * Both are stored hashed and share one expiry, so `findValidCode` needs no
   * branch: typing the six digits and clicking the emailed link are the same
   * lookup. Any previous codes for the user are cleared first, so only the
   * newest is ever live.
   */
  create: async (userId: number, code: string, uuidToken?: string): Promise<void> => {
    const expiresAt = new Date(Date.now() + TTL_MS);

    const rows = [{ user_id: userId, code: hashToken(code), expires_at: expiresAt }];
    if (uuidToken) rows.push({ user_id: userId, code: hashToken(uuidToken), expires_at: expiresAt });

    // Wrapped in a transaction, which the raw version was not: a failure between
    // the delete and the insert used to leave the account with no valid code at
    // all and no way to tell, since registration only rolls back on a thrown
    // error from the pair as a whole.
    await db.transaction(async tx => {
      await tx.delete(emailVerifications).where(eq(emailVerifications.user_id, userId));
      await tx.insert(emailVerifications).values(rows);
    });
  },

  findValidCode: async (userId: number, code: string): Promise<boolean> => {
    const rows = await db
      .select({ id: emailVerifications.id })
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.user_id, userId),
          eq(emailVerifications.code, hashToken(code)),
          // Expiry is compared by the database clock, not the app's.
          gt(emailVerifications.expires_at, sql`now()`)
        )
      )
      .limit(1);

    return rows.length > 0;
  },

  deleteByUserId: async (userId: number): Promise<void> => {
    await db.delete(emailVerifications).where(eq(emailVerifications.user_id, userId));
  }
};

export default EmailVerification;
