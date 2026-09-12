/**
 * Parses a positive integer route parameter.
 *
 * `Number('not-a-number')` is NaN, which Postgres rejects with a type error —
 * surfacing as a 500 for what is really a malformed request. Returns null so
 * callers can answer 400 instead.
 */
export const parseId = (raw: string | string[] | undefined): number | null => {
  // Express 5 types a param as string[] for repeated segments; a duplicated id
  // is not a valid single id, so reject it rather than guessing which to use.
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
