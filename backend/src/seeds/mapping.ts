import { SheetRow, normalizeHeader } from './excel';

/**
 * Builds a lookup from canonical field name to the normalized header spellings
 * that map onto it, so sheets can use different wording for the same concept.
 */
export const buildLookup = (aliases: Record<string, string[]>): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(aliases).map(([field, names]) => [field, names.map(normalizeHeader)])
  );

export const readField = (
  row: SheetRow,
  lookup: Record<string, string[]>,
  field: string
): string => {
  for (const key of lookup[field] ?? []) {
    const value = row[key];
    if (value && value.trim()) return value.trim();
  }
  return '';
};

/**
 * Splits a list cell. Semicolons win when present ("Techo Scholarship; UYFC
 * Scholarship;"), otherwise commas ("Programming, databases, teamwork"), so
 * entries that themselves contain commas can be written with semicolons.
 */
export const splitList = (value: string): string[] => {
  if (!value.trim()) return [];
  const separator = value.includes(';') ? ';' : ',';
  return value
    .split(separator)
    .map(part => part.trim())
    .filter(Boolean);
};

/** NOT NULL columns the sheets do not supply are stored as NULL, not invented. */
export const orNull = (value: string): string | null => (value.trim() ? value.trim() : null);

/* ------------------------------------------------------------------ */
/* URLs                                                                */
/* ------------------------------------------------------------------ */

const HOSTNAME_LIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]|$)/i;

/**
 * Source cells hold anything from a clean URL to a bare domain
 * ("daad.de (EPOS list)"), several sites ("nus.edu.sg / ntu.edu.sg"), prose
 * ("Company careers pages"), or two URLs accidentally concatenated.
 * Returns '' when there is no usable link.
 */
export const normalizeUrl = (raw: string): string => {
  let value = raw.trim();
  if (!value) return '';

  // "https://a.org/https://a.org" -> keep the first URL only.
  if (value.startsWith('http')) {
    const second = value.indexOf('http', 4);
    if (second > 0) value = value.slice(0, second);
  }

  // Strip trailing notes: "daad.de (EPOS list)" -> "daad.de". A trailing slash
  // is left alone — it is part of the link as the source wrote it.
  value = value.replace(/\s*\(.*$/, '').trim();

  const token = value
    .split(/\s+/)
    .map(t => t.replace(/^[<([]+/, '').replace(/[.,;>)\]]+$/, ''))
    .find(t => /^https?:\/\//i.test(t) || HOSTNAME_LIKE.test(t));
  if (!token) return '';
  value = token;

  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  try {
    return new URL(value).toString();
  } catch {
    return '';
  }
};

export const hostnameOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const NEWS_DOMAINS = ['malaymail.com', 'khmertimeskh.com', 'phnompenhpost.com', 'cambodianess.com'];
const SOCIAL_DOMAINS = ['facebook.com', 'fb.com', 'instagram.com', 't.me', 'telegram.me', 'tiktok.com', 'x.com', 'twitter.com'];

/**
 * Only structurally government/academic domains count as 'official'. A body's
 * own .org site is real but not machine-verifiable, so it stays 'organisation'.
 */
const OFFICIAL_HOST_PATTERNS = [
  /\.(gov|edu)$/,
  /\.(gov|edu|ac|go)\.[a-z]{2,3}$/, // .edu.kh, .ac.uk, .go.jp, .gov.au
  /(^|\.)europa\.eu$/
];

const matchesDomain = (host: string, domains: string[]): boolean =>
  domains.some(d => host === d || host.endsWith(`.${d}`));

export const classifySource = (url: string): string => {
  const host = hostnameOf(url);
  if (!host) return 'unknown';
  if (matchesDomain(host, SOCIAL_DOMAINS)) return 'social_media';
  if (matchesDomain(host, NEWS_DOMAINS)) return 'news';
  if (OFFICIAL_HOST_PATTERNS.some(p => p.test(host))) return 'official';
  return 'organisation';
};

/* ------------------------------------------------------------------ */
/* Providers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Ordered — first match wins, so more specific rules come first.
 * "Prince Foundation, in partnership with MoEYS" is a foundation, not a
 * ministry; "Asian Development Bank" is an IGO, not a commercial bank.
 */
const PROVIDER_PATTERNS: Array<[RegExp, string]> = [
  [/\bfoundation\b|\btrust\b/i, 'foundation'],
  [/\b(united nations|asian development bank|world bank|asem|aun|umap|iaeste|aiesec|uyfc|conservancy|network|association|ngo)\b/i, 'organisation'],
  [/\b(govt|government|ministry|moeys|mptc|embassy|dfat|fcdo|niied|mext|daad|dept of state|department of state|council|commission|agenc(?:y|ies))\b/i, 'government'],
  // Unanchored 'bank' so "Maybank" matches; IGO banks are caught above.
  [/(bank|google|microsoft|deepmind|\bcorp\b|\binc\b|\bltd\b|\bcompany\b)/i, 'company'],
  [/\b(university|universities|institute|institutes|school|college|univ|academy)\b/i, 'university'],
  // Cambodian institutions that appear as bare abbreviations in the sheets.
  [/\b(aupp|cadt|rupp|rule|itc|puc|aeu|ppiu|num|uef|ifl|setec|beltei|camtech|paragon|limkokwing|vanda|amt)\b/i, 'university']
];

export const classifyProvider = (provider: string): string => {
  for (const [pattern, label] of PROVIDER_PATTERNS) {
    if (pattern.test(provider)) return label;
  }
  return 'unknown';
};

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

/**
 * The sheets are written in Cambodian local time (UTC+7, no DST). Excel stores
 * a date cell as a timezone-less wall-clock value and ExcelJS hands it back as
 * though it were UTC, so "18 Sep 2026, 5:00 PM" arrives as 17:00Z. Storing that
 * instant unchanged would put every deadline 7 hours late — midnight on the
 * 19th rather than 5pm on the 18th.
 */
const SHEET_UTC_OFFSET_MINUTES = 7 * 60;

/** Treat y/m/d h:m as a wall-clock reading in the sheet's timezone. */
const fromSheetLocal = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0
): Date => new Date(Date.UTC(year, month, day, hours, minutes) - SHEET_UTC_OFFSET_MINUTES * 60_000);

/**
 * Real Excel dates arrive as ISO strings. Prose deadlines ("Rolling",
 * "Not announced") cannot become a timestamp, so only unambiguous dates are
 * converted and the raw text is kept in deadline_note.
 */
export const parseDate = (raw: string): Date | null => {
  if (!raw) return null;

  // A real Excel date cell: read the wall-clock fields, then apply the offset.
  const stamp = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (stamp) {
    return fromSheetLocal(+stamp[1], +stamp[2] - 1, +stamp[3], +stamp[4], +stamp[5]);
  }

  // Date-only text. No trailing \b — it fails against "2026-09-18T00:00".
  const iso = raw.match(/\b(\d{4})-(\d{2})-(\d{2})(?![\d-])/);
  if (iso) return fromSheetLocal(+iso[1], +iso[2] - 1, +iso[3]);

  const dayFirst = raw.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b/);
  if (dayFirst) {
    const month = MONTHS[dayFirst[2].slice(0, 3).toLowerCase()];
    if (month !== undefined) return fromSheetLocal(+dayFirst[3], month, +dayFirst[1]);
  }

  const monthFirst = raw.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (monthFirst) {
    const month = MONTHS[monthFirst[1].slice(0, 3).toLowerCase()];
    if (month !== undefined) return fromSheetLocal(+monthFirst[3], month, +monthFirst[2]);
  }

  return null;
};

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

/**
 * Ordered: the headline benefit wins over any figure mentioned later. Benefits
 * read "Full tuition; $300/year admin fee remains" — the award is the full
 * tuition, not the leftover fee, so coverage patterns are tried before amounts.
 */
const AMOUNT_PATTERNS: RegExp[] = [
  /\bup to\s+\d{1,3}\s?%[^.,;]*/i,
  /\bup to\s+~?[$€£¥₩]\s?[\d,]+[^.,;]*/i,
  /\bfull\b[^.,;]{0,40}\b(?:tuition|funding|coverage|waiver|scholarship)\b[^.,;]*/i,
  /\b\d{1,3}\s?%\s+tuition[^.,;]*/i,
  /\b\d{1,3}\s?%[^.,;()]{0,30}\b(?:scholarship|discount|discounts|waiver|reduction|reductions|off|coverage)\b/i,
  /\btuition[^.,;()]{0,25}\b(?:waiver|waivers|discount|discounts|reduction|reductions|coverage|free)\b/i,
  /(?:USD|EUR|GBP|AUD|JPY|KRW|US\$)\s?~?\s?[\d,]+(?:\.\d+)?(?:\s?(?:k|million|per year))?/i,
  /~?[$€£¥₩]\s?[\d,]+(?:\.\d+)?\s?(?:k|million)?(?:\s?\/\s?year)?/i
];

/**
 * Prefer an explicit funding label; otherwise summarise the benefits prose.
 *
 * A pattern only counts when it matches at the *start* of the text. Awards are
 * written with the qualifier first ("5–35% tuition", "Up to $5,000", "Partial
 * to full tuition"), so a match further in would drop that qualifier and
 * overstate the award — "5–35%" must never be shown as "35%". Anything that
 * does not summarise cleanly keeps the benefits text verbatim.
 */
export const deriveAmount = (funding: string, benefits: string): string => {
  if (funding) return funding;

  const text = benefits.trim();
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match.index === 0) return match[0].trim();
  }
  return text || 'Not stated in source sheet';
};

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

const RISKY_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top'];

/**
 * Offline checks only — seeding must not depend on the network. Live
 * reachability and Safe Browsing checks stay in the request path.
 */
export const assessSafety = (url: string, rawUrl: string, sourceType: string): string[] => {
  const warnings: string[] = [];

  if (!url) {
    warnings.push(
      rawUrl
        ? `Source sheet gives no usable link (listed as "${rawUrl}") — verify before applying.`
        : 'No official link listed in the source sheet — verify before applying.'
    );
    return warnings;
  }

  if (!url.startsWith('https://')) {
    warnings.push('Source does not use HTTPS — connection to this site is not encrypted.');
  }

  const host = hostnameOf(url);
  if (RISKY_TLDS.some(tld => host.endsWith(tld))) {
    warnings.push(`Domain uses a TLD (${host.split('.').pop()}) commonly associated with throwaway domains.`);
  }
  if (host.split('.').length > 4) {
    warnings.push('Domain has an unusually nested hostname, which can be used to imitate a trusted domain.');
  }
  if (sourceType === 'news') {
    warnings.push('Link points to a news article rather than an official application page.');
  }
  if (sourceType === 'social_media') {
    warnings.push('Link points to a social media post rather than an official application page.');
  }
  return warnings;
};

/** 'verified' means it passed the offline checks, not that a human vetted it. */
export const deriveVerifiedStatus = (url: string, warnings: string[]): string => {
  if (!url) return 'unverified';
  return warnings.length > 0 ? 'flagged' : 'verified';
};
