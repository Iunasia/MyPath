import {
  assessSafety,
  classifyProvider,
  classifySource,
  deriveAmount,
  deriveVerifiedStatus,
  hostnameOf,
  normalizeUrl
} from '../seeds/mapping';
import {
  OPPORTUNITY_TYPES,
  readDate,
  readEnum,
  readString,
  readStringArray,
  readUrl,
  isPlainObject,
  type FieldErrors
} from './validation';

export interface ScholarshipWrite {
  /** Whitelisted column values to insert/update. Empty when validation failed. */
  fields: Record<string, unknown>;
  errors: FieldErrors;
}

/** Read-only columns an admin cannot set; blank input must never null them. */
const NOT_NULL = [
  'title',
  'provider',
  'description',
  'amount',
  'coverage',
  'eligibility',
  'application_link',
  'country',
  'opportunity_type',
  'provider_type',
  'source',
  'source_url',
  'source_type',
  'verified_status'
];

/**
 * Parse and validate an admin scholarship write.
 *
 * Provenance (`source`, `source_url`, `source_type`, `verified_status`,
 * `safety_warnings`) is always *derived from the application link*, never taken
 * from the client, so a hand-typed row carries the same DMIL metadata the seed
 * would have produced. Pass `partial: true` for PATCH.
 */
export const parseScholarshipWrite = (
  body: unknown,
  { partial }: { partial: boolean }
): ScholarshipWrite => {
  const errors: FieldErrors = {};
  const fields: Record<string, unknown> = {};

  if (!isPlainObject(body)) {
    return { fields, errors: { body: 'Expected a JSON object.' } };
  }

  const take = <T>(
    key: string,
    reader: { present: boolean; value?: T; error?: string },
    required = false
  ): void => {
    if (reader.error) {
      errors[key] = reader.error;
      return;
    }
    if (reader.present) {
      fields[key] = reader.value;
      return;
    }
    // Required only on create — a PATCH is allowed to send any subset.
    if (required && !partial) errors[key] = `${key} is required.`;
  };

  take('title', readString(body, 'title', { min: 1, max: 300 }), true);
  take('provider', readString(body, 'provider', { min: 1, max: 200 }), true);
  take('description', readString(body, 'description', { min: 1, max: 5000 }), true);
  take('application_link', readUrl(body, 'application_link'), true);
  take('provider_type', readEnum(body, 'provider_type', ['government', 'university', 'foundation', 'company', 'organisation', 'unknown'] as const));
  take('opportunity_type', readEnum(body, 'opportunity_type', OPPORTUNITY_TYPES));
  take('amount', readString(body, 'amount', { max: 300 }));
  take('coverage', readString(body, 'coverage', { max: 2000 }));
  take('eligibility', readString(body, 'eligibility', { max: 2000 }));
  take('degree_level', readString(body, 'degree_level', { max: 120 }));
  take('field_of_study', readString(body, 'field_of_study', { max: 200 }));
  take('application_process', readString(body, 'application_process', { max: 3000 }));
  take('country', readString(body, 'country', { max: 120 }));
  take('image_url', readUrl(body, 'image_url'));
  take('deadline', readDate(body, 'deadline'));
  take('deadline_note', readString(body, 'deadline_note', { max: 300 }));
  take('documents', readStringArray(body, 'documents'));

  if (Object.keys(errors).length > 0) return { fields, errors };

  // Provenance follows the application link — recomputed whenever it is set.
  if ('application_link' in fields || !partial) {
    const raw = typeof fields.application_link === 'string' ? fields.application_link : '';
    const link = normalizeUrl(raw) || raw;
    const sourceType = classifySource(link);
    const warnings = assessSafety(link, raw, sourceType);
    fields.source = hostnameOf(link) || String(fields.provider ?? '');
    fields.source_url = link;
    fields.source_type = sourceType;
    fields.safety_warnings = warnings;
    fields.verified_status = deriveVerifiedStatus(link, warnings);
  }

  // On create, fill the NOT NULL columns the form left out with honest defaults.
  if (!partial) {
    if (fields.coverage == null) fields.coverage = 'See official site';
    if (fields.eligibility == null) fields.eligibility = 'See official site';
    if (fields.country == null) fields.country = 'Cambodia';
    if (fields.opportunity_type == null) fields.opportunity_type = 'scholarship';
    if (fields.amount == null) fields.amount = deriveAmount('', String(fields.coverage));
    if (fields.provider_type == null) fields.provider_type = classifyProvider(String(fields.provider));
    if (fields.documents === undefined) fields.documents = [];
  }

  // A blank value must never null a NOT NULL column; drop the key instead.
  for (const key of NOT_NULL) {
    if (key in fields && (fields[key] === null || fields[key] === '')) delete fields[key];
  }

  return { fields, errors };
};
