/**
 * Information Check — the DMIL feature.
 *
 * The seed importer already assesses every listing offline (missing link,
 * non-HTTPS, throwaway TLD, news or social-media source) and stores the result
 * on the row. This turns that stored provenance into the panel the UI shows:
 * where the information came from, whether it was verified, when, and what a
 * student should be careful about.
 *
 * Offline and synchronous by design — it runs on every list response. Live
 * reachability and Safe Browsing checks belong in a background job, not here.
 */

interface ScholarshipData {
  source?: string;
  source_url?: string;
  source_type?: string;
  provider?: string;
  verified_status?: string;
  last_verified?: Date | string | null;
  safety_warnings?: string[];
  [key: string]: any;
}

export interface InfoCheck {
  /** True when a student should look twice before applying. */
  isRisky: boolean;
  /** Human-readable concerns, safe to render directly. */
  reasons: string[];
  /** Hostname the information came from, e.g. "cadt.edu.kh". */
  source: string | null;
  /** Link to the original page, so the claim can be checked at the source. */
  sourceUrl: string | null;
  /** 'official' | 'organisation' | 'news' | 'social_media' | 'unknown' */
  sourceType: string;
  /** 'verified' | 'flagged' | 'unverified' — passed our offline checks, not a human review. */
  verifiedStatus: string;
  /** When the listing was last confirmed against its source, if ever. */
  lastVerified: string | null;
  /** One line explaining the verdict, for the "Why should I trust this?" panel. */
  summary: string;
}

const TRUST_SUMMARY: Record<string, string> = {
  official:
    'This information comes from an official government or academic source.',
  organisation:
    "This information comes from the provider's own website, which we could not independently verify as an official domain.",
  news: 'This information comes from a news article rather than the provider itself.',
  social_media:
    'This information comes from a social media post rather than an official application page.',
  unknown: 'No original source link was recorded for this listing.'
};

export const generateInfoCheck = (scholarship: ScholarshipData): InfoCheck => {
  const sourceUrl = scholarship.source_url?.trim() || '';
  const sourceType = scholarship.source_type || 'unknown';
  const verifiedStatus = scholarship.verified_status || 'unverified';

  // Warnings recorded at seed time are the primary signal.
  const reasons: string[] = [...(scholarship.safety_warnings ?? [])];

  const add = (reason: string) => {
    if (!reasons.includes(reason)) reasons.push(reason);
  };

  // Re-check the cheap invariants here too, so a row written by any other path
  // (a manual insert, a future admin form) is still assessed.
  if (!sourceUrl) {
    add('No original source link is recorded — verify before applying.');
  } else if (!sourceUrl.startsWith('https://')) {
    add('Source does not use HTTPS — the connection to this site is not encrypted.');
  }

  if (verifiedStatus === 'flagged' && reasons.length === 0) {
    add('This listing was flagged during verification.');
  }

  const lastVerified =
    scholarship.last_verified instanceof Date
      ? scholarship.last_verified.toISOString()
      : scholarship.last_verified ?? null;

  return {
    isRisky: verifiedStatus === 'flagged' || reasons.length > 0,
    reasons,
    source: scholarship.source?.trim() || null,
    sourceUrl: sourceUrl || null,
    sourceType,
    verifiedStatus,
    lastVerified,
    summary: TRUST_SUMMARY[sourceType] ?? TRUST_SUMMARY.unknown
  };
};
