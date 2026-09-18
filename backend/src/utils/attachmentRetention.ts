/**
 * Deletes screenshots once their request has been answered for a while.
 *
 * The verdict and the student's text stay forever; only the images go. They
 * are the costly part to store, and often the most personal — a screenshot of
 * a chat can carry names and phone numbers we have no reason to keep.
 *
 * The object is deleted before its row, so a storage failure leaves the row in
 * place and the next run retries it. Never the other way round, which would
 * orphan files nothing points at any more.
 */
import VerificationAttachment, { ATTACHMENT_RETENTION_DAYS } from '../models/VerificationAttachment';
import { getStorage } from './storage';

export const purgeExpiredAttachments = async (
  days = ATTACHMENT_RETENTION_DAYS
): Promise<{ deleted: number; failed: number }> => {
  const storage = getStorage();
  if (!storage) return { deleted: 0, failed: 0 };

  let deleted = 0;
  let failed = 0;

  for (;;) {
    const batch = await VerificationAttachment.listExpired(days);
    if (batch.length === 0) break;

    const removed: number[] = [];
    for (const attachment of batch) {
      try {
        await storage.delete(attachment.storage_key);
        removed.push(attachment.id);
      } catch (err) {
        failed += 1;
        console.error('Could not delete attachment', attachment.id, err instanceof Error ? err.message : err);
      }
    }

    await VerificationAttachment.deleteByIds(removed);
    deleted += removed.length;

    // Everything in this batch failed: stop rather than spin on the same rows.
    if (removed.length === 0) break;
  }

  return { deleted, failed };
};
