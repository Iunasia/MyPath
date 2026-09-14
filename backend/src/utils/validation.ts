/**
 * Small request-validation helpers for admin content writes.
 *
 * No schema library: the API's error contract is a single `{ error }` string,
 * and the admin form only needs field-level messages. Each reader also reports
 * whether the key was **present**, which is what separates "not sent, leave it
 * alone" (PATCH) from "sent blank, clear it".
 */

export type FieldErrors = Record<string, string>;

export const OPPORTUNITY_TYPES = ['scholarship', 'exchange', 'internship'] as const;
export const SOURCE_TYPES = ['official', 'organisation', 'news', 'social_media', 'unknown'] as const;
export const PROVIDER_TYPES = ['government', 'university', 'foundation', 'company', 'organisation', 'unknown'] as const;
export const VERIFIED_STATUSES = ['verified', 'flagged', 'unverified'] as const;

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

interface Reader<T> {
  present: boolean;
  value?: T;
  error?: string;
}

interface StringRule {
  max?: number;
  min?: number;
}

/** A trimmed string, or null when blank. `present:false` means the key wasn't sent. */
export const readString = (
  body: Record<string, unknown>,
  key: string,
  { max = 2000, min = 0 }: StringRule = {}
): Reader<string | null> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined) return { value: null, present: true };
  if (typeof raw !== 'string') return { error: `${key} must be text.`, present: true };
  const value = raw.trim();
  if (value.length < min) return { error: `${key} cannot be blank.`, present: true };
  if (value.length > max) return { error: `${key} is too long (max ${max} characters).`, present: true };
  return { value: value || null, present: true };
};

export const readEnum = <T extends string>(
  body: Record<string, unknown>,
  key: string,
  allowed: readonly T[]
): Reader<T | null> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined || raw === '') return { value: null, present: true };
  if (typeof raw !== 'string' || !(allowed as readonly string[]).includes(raw)) {
    return { error: `${key} must be one of: ${allowed.join(', ')}.`, present: true };
  }
  return { value: raw as T, present: true };
};

/** A list of trimmed, non-empty strings, capped so a huge payload can't bloat a row. */
export const readStringArray = (body: Record<string, unknown>, key: string): Reader<string[]> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined) return { value: [], present: true };
  if (!Array.isArray(raw)) return { error: `${key} must be a list.`, present: true };
  const value = raw
    .filter((entry): entry is string => typeof entry === 'string')
    .map(entry => entry.trim())
    .filter(Boolean)
    .slice(0, 200);
  return { value, present: true };
};

export const readDate = (body: Record<string, unknown>, key: string): Reader<Date | null> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined || raw === '') return { value: null, present: true };
  if (typeof raw !== 'string') return { error: `${key} must be a date.`, present: true };
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `${key} is not a valid date — put prose like "Rolling" in the note instead.`, present: true };
  }
  return { value: parsed, present: true };
};

export const readUrl = (body: Record<string, unknown>, key: string): Reader<string | null> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined || raw === '') return { value: null, present: true };
  if (typeof raw !== 'string' || !isHttpUrl(raw.trim())) {
    return { error: `${key} must be an http(s) link.`, present: true };
  }
  return { value: raw.trim(), present: true };
};

export const readInt = (body: Record<string, unknown>, key: string): Reader<number | null> => {
  if (!(key in body)) return { present: false };
  const raw = body[key];
  if (raw === null || raw === undefined || raw === '') return { value: null, present: true };
  const value = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(value)) return { error: `${key} must be a whole number.`, present: true };
  return { value, present: true };
};

export interface WriteFieldReader {
  key: string;
  /** Required only on create; a PATCH may send any subset. */
  required?: boolean;
  read: () => Reader<unknown>;
}

/**
 * Shared assembly for the catalogue write parsers: run each field reader,
 * collect per-field errors, then apply create-time defaults and drop blank
 * values for NOT NULL columns.
 */
export const collectFields = (
  readers: WriteFieldReader[],
  options: { partial: boolean; defaults?: Record<string, unknown>; notNull?: string[] }
): { fields: Record<string, unknown>; errors: FieldErrors } => {
  const fields: Record<string, unknown> = {};
  const errors: FieldErrors = {};

  for (const reader of readers) {
    const result = reader.read();
    if (result.error) {
      errors[reader.key] = result.error;
      continue;
    }
    if (result.present) {
      fields[reader.key] = result.value;
      continue;
    }
    if (reader.required && !options.partial) errors[reader.key] = `${reader.key} is required.`;
  }

  if (Object.keys(errors).length > 0) return { fields, errors };

  if (!options.partial) {
    for (const [key, value] of Object.entries(options.defaults ?? {})) {
      if (fields[key] == null) fields[key] = value;
    }
  }
  for (const key of options.notNull ?? []) {
    if (key in fields && (fields[key] === null || fields[key] === '')) delete fields[key];
  }

  return { fields, errors };
};
