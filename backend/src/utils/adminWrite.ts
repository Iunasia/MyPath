import { Request } from 'express';
import User from '../models/User';

/** Shared helpers for the admin catalogue write endpoints. */

export const actorOf = (req: Request): number | null => (req.session as any)?.userId ?? null;

export const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';

/** Admins may ask for archived rows with `?includeArchived=1`; nobody else can. */
export const wantsArchived = async (req: Request): Promise<boolean> => {
  if (req.query.includeArchived !== '1') return false;
  const userId = (req.session as any)?.userId;
  if (!userId) return false;
  const user = await User.findById(userId);
  return user?.role === 'admin';
};

export const normalise = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return JSON.stringify(value);
  return value ?? null;
};

/** Only the fields that actually changed, so the history reads as edits. */
export const diff = (before: Record<string, unknown>, fields: Record<string, unknown>) => {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, next] of Object.entries(fields)) {
    if (JSON.stringify(normalise(before[key])) !== JSON.stringify(normalise(next))) {
      changes[key] = { from: normalise(before[key]), to: normalise(next) };
    }
  }
  return changes;
};

export const reasonOf = (req: Request): string | null =>
  typeof req.body?.reason === 'string' && req.body.reason.trim() ? req.body.reason.trim() : null;

export const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString() : Array.isArray(value) ? value.join('; ') : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export const toCsv = (columns: readonly string[], rows: Record<string, unknown>[]): string =>
  [
    columns.join(','),
    ...rows.map(row => columns.map(column => csvCell(row[column])).join(','))
  ].join('\r\n');
