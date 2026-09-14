import type { AdminScholarshipInput } from '../models/Scholarship';
import {
  assessSafety,
  classifyProvider,
  classifySource,
  deriveVerifiedStatus,
  hostnameOf,
  parseDate
} from '../seeds/mapping';

/**
 * Validates a scholarship an admin adds in the app and derives the same
 * provenance fields the importer does (`source_type`, `safety_warnings`,
 * `verified_status`), so an admin-added listing gets the same Information Check
 * as one from the sheet. A flagged link is accepted — adding it is the admin's
 * call — and the warnings come back with the created listing.
 */

const OPPORTUNITY_TYPES = ['scholarship', 'exchange', 'internship'] as const;

const MAX_SHORT = 300;
const MAX_LONG = 5000;

type Result = { value: AdminScholarshipInput } | { error: string };

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** An absolute http(s) URL, or '' when it is not one. */
const httpUrl = (value: string): string => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
};

/** Accepts an array, or one entry per line / semicolon, as the form sends it. */
const list = (value: unknown): string[] => {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\n;]/) : [];
  return items.map(text).filter(Boolean);
};

export const parseAdminScholarship = (body: unknown): Result => {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const title = text(input.title);
  const provider = text(input.provider);
  const description = text(input.description);
  const amount = text(input.amount);
  const rawLink = text(input.application_link);

  const missing = [
    ['title', title],
    ['provider', provider],
    ['description', description],
    ['amount', amount],
    ['application_link', rawLink]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length > 0) {
    return { error: `Missing required field(s): ${missing.join(', ')}.` };
  }

  const short = {
    title,
    provider,
    amount,
    degree_level: text(input.degree_level),
    field_of_study: text(input.field_of_study),
    country: text(input.country),
    deadline_note: text(input.deadline_note)
  };
  const long = {
    description,
    coverage: text(input.coverage),
    eligibility: text(input.eligibility),
    application_process: text(input.application_process)
  };

  for (const [fields, max] of [[short, MAX_SHORT], [long, MAX_LONG]] as const) {
    const over = Object.entries(fields).find(([, value]) => value.length > max);
    if (over) return { error: `${over[0]} must be ${max} characters or fewer.` };
  }

  const link = httpUrl(rawLink);
  if (!link) return { error: 'application_link must be a full http(s) URL.' };

  const rawImage = text(input.image_url);
  const imageUrl = rawImage ? httpUrl(rawImage) : '';
  if (rawImage && !imageUrl) return { error: 'image_url must be a full http(s) URL.' };

  // A calendar date from the form, read as Phnom Penh time like the sheets.
  const rawDeadline = text(input.deadline);
  let deadline: Date | null = null;
  if (rawDeadline) {
    const match = rawDeadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    deadline = match ? parseDate(rawDeadline) : null;
    const real =
      deadline && match && new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])).getUTCDate() === +match[3];
    if (!real) return { error: 'deadline must be a real date in YYYY-MM-DD form.' };
  }

  const type = text(input.opportunity_type) || 'scholarship';
  if (!(OPPORTUNITY_TYPES as readonly string[]).includes(type)) {
    return { error: `opportunity_type must be one of: ${OPPORTUNITY_TYPES.join(', ')}.` };
  }

  const sourceType = classifySource(link);
  const warnings = assessSafety(link, link, sourceType);

  return {
    value: {
      title,
      provider,
      provider_type: classifyProvider(provider),
      description,
      amount,
      coverage: long.coverage || 'See official site',
      eligibility: long.eligibility || 'See official site',
      degree_level: short.degree_level || null,
      field_of_study: short.field_of_study || null,
      documents: list(input.documents),
      application_process: long.application_process || null,
      deadline,
      deadline_note: deadline ? null : short.deadline_note || null,
      application_link: link,
      image_url: imageUrl || null,
      country: short.country || 'Cambodia',
      opportunity_type: type,
      source: hostnameOf(link) || provider,
      source_url: link,
      source_type: sourceType,
      verified_status: deriveVerifiedStatus(link, warnings),
      safety_warnings: warnings
    }
  };
};
