/**
 * `npm run purge:attachments` — the retention sweep, for hosts without the
 * Vercel cron (a VPS crontab, or by hand). Same code the cron endpoint runs.
 */
import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db';
import { purgeExpiredAttachments } from '../utils/attachmentRetention';

const main = async () => {
  const { deleted, failed } = await purgeExpiredAttachments();
  console.log(`Removed ${deleted} expired screenshot(s); ${failed} could not be deleted.`);
  await pool.end();
  if (failed > 0) process.exitCode = 1;
};

main().catch(async err => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
