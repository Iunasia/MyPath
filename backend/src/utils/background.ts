/**
 * Runs work after the response has been sent — alerts and emails.
 *
 * A bare `void promise` is not enough on Vercel: the function may be frozen as
 * soon as the response is flushed, and an unfinished fetch to Telegram or the
 * email provider silently never completes. `waitUntil` keeps the invocation
 * alive until the promise settles. Anywhere else it is a no-op and the promise
 * simply runs on the event loop as before.
 *
 * Failures are logged, never thrown: the caller has already answered.
 */
import { waitUntil } from '@vercel/functions';

export const background = (label: string, work: Promise<unknown>): void => {
  const guarded = work.catch(err => {
    console.error(`Background task "${label}" failed:`, err instanceof Error ? err.message : err);
  });
  waitUntil(guarded);
};
