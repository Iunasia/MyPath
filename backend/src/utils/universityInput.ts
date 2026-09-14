import { hostnameOf } from '../seeds/mapping';
import {
  collectFields,
  isPlainObject,
  readInt,
  readString,
  readStringArray,
  readUrl,
  type FieldErrors,
} from './validation';

export interface UniversityWrite {
  fields: Record<string, unknown>;
  errors: FieldErrors;
}

/** Public URL segment: lowercase words joined by single hyphens. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const deriveSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * Validation for admin university create/edit. `source`/`source_url` are
 * derived from `website`, and `slug` is derived from the name when left blank —
 * so a hand-typed row carries the same provenance and stable URL the seed would
 * have produced.
 */
export const parseUniversityWrite = (
  body: unknown,
  { partial }: { partial: boolean }
): UniversityWrite => {
  if (!isPlainObject(body)) return { fields: {}, errors: { body: 'Expected a JSON object.' } };

  const { fields, errors } = collectFields(
    [
      { key: 'slug', read: () => readString(body, 'slug', { max: 80 }) },
      { key: 'name', required: true, read: () => readString(body, 'name', { min: 1, max: 250 }) },
      { key: 'short_name', read: () => readString(body, 'short_name', { max: 80 }) },
      { key: 'country', read: () => readString(body, 'country', { min: 1, max: 120 }) },
      { key: 'city', read: () => readString(body, 'city', { min: 1, max: 120 }) },
      { key: 'type', read: () => readString(body, 'type', { max: 60 }) },
      { key: 'ranking', read: () => readInt(body, 'ranking') },
      { key: 'description', required: true, read: () => readString(body, 'description', { min: 1, max: 5000 }) },
      { key: 'website', required: true, read: () => readUrl(body, 'website') },
      { key: 'phone', read: () => readString(body, 'phone', { max: 60 }) },
      { key: 'established', read: () => readString(body, 'established', { max: 40 }) },
      { key: 'student_count', read: () => readString(body, 'student_count', { max: 60 }) },
      { key: 'image_url', read: () => readUrl(body, 'image_url') },
      { key: 'tuition_range', read: () => readString(body, 'tuition_range', { max: 200 }) },
      { key: 'acceptance_rate', read: () => readString(body, 'acceptance_rate', { max: 60 }) },
      { key: 'programs', read: () => readStringArray(body, 'programs') },
      { key: 'scholarships', read: () => readStringArray(body, 'scholarships') }
    ],
    {
      partial,
      defaults: { country: 'Cambodia', city: 'Phnom Penh' },
      notNull: ['name', 'country', 'city', 'description', 'website']
    }
  );

  if (Object.keys(errors).length > 0) return { fields, errors };

  // Provenance follows the website.
  if ('website' in fields || !partial) {
    const website = String(fields.website ?? '');
    fields.source = hostnameOf(website) || String(fields.name ?? '');
    fields.source_url = website;
  }

  // Normalise or derive the slug. A blank slug on edit is dropped (leave as-is).
  if ('slug' in fields) {
    const raw = fields.slug;
    if (raw === null || raw === '') {
      delete fields.slug;
    } else {
      const slug = String(raw).trim().toLowerCase();
      if (!SLUG.test(slug)) {
        errors.slug = 'Slug may only contain lowercase letters, numbers and single hyphens.';
      } else {
        fields.slug = slug;
      }
    }
  }
  if (!partial && fields.slug === undefined) {
    const derived = deriveSlug(String(fields.name ?? ''));
    if (derived) fields.slug = derived;
  }

  return { fields, errors };
};
