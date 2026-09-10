/**
 * Translates backend rows into the shapes the pages already render.
 *
 * The two sides disagree on nearly every convention — snake_case vs camelCase,
 * integer ids vs slugs, ISO timestamps vs display strings, single strings vs
 * bullet arrays. Keeping every conversion here means the page components stay
 * as they were and there is one file to fix when the API moves.
 */
import type { ApiInfoCheck, ApiScholarship } from "./api";
import { SCHOLARSHIPS_DATA, type Scholarship } from "@/app/data/scholarships";

/** The view model is the existing page shape plus the DMIL verdict. */
export interface ScholarshipView extends Scholarship {
  /** Numeric backend id, for API calls. */
  apiId: number;
  infoCheck: ApiInfoCheck;
  /** Raw benefits text, when the bullet split is not enough. */
  coverageText: string;
  deadlineNote: string | null;
}

/* ------------------------------------------------------------------ */
/* Text                                                                */
/* ------------------------------------------------------------------ */

/**
 * Spreadsheet cells hold one line where the page renders bullets. Split on
 * semicolons and newlines — never on commas, which appear inside a single
 * requirement ("Grade A, B, or C").
 */
const toBullets = (text: string | null | undefined): string[] => {
  if (!text?.trim()) return [];
  return text
    .split(/[;\n]+/)
    .map(part => part.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
};

/** Comma-separated list cells (majors, fields) — commas are the separator here. */
const toList = (text: string | null | undefined): string[] => {
  if (!text?.trim()) return [];
  return text
    .split(/[;,\n]+/)
    .map(part => part.trim())
    .filter(Boolean);
};

/* ------------------------------------------------------------------ */
/* Deadlines                                                           */
/* ------------------------------------------------------------------ */

const PHNOM_PENH = "Asia/Phnom_Penh";

/**
 * Deadlines are stored as instants written in Cambodian local time, so they
 * must be displayed in Phnom Penh — not the viewer's timezone, which would
 * show a student abroad the wrong day.
 */
export const formatDeadline = (iso: string | null, note: string | null): string => {
  if (!iso) return note?.trim() || "Not announced";

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return note?.trim() || "Not announced";

  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);

  // Midnight is the importer's "no time given" case — don't show 12:00 am.
  return time === "12:00 am" ? day : `${day}, ${time}`;
};

export const formatLastVerified = (iso: string | null): string => {
  if (!iso) return "Not yet verified";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not yet verified";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
};

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

/** `provider_type` (6 values) collapsed onto the page's 3 filter categories. */
const toCategory = (providerType: string): Scholarship["category"] => {
  switch (providerType) {
    case "government":
      return "Government";
    case "foundation":
    case "organisation":
      return "Foundation / Non-Profit";
    default:
      return "University";
  }
};

/**
 * The page filters on four fixed coverage bands, but the source is free text.
 * Bucket conservatively: only claim "100%" when the text actually says so.
 */
const toCoverageBand = (amount: string, coverage: string): Scholarship["coverage"] => {
  const text = `${amount} ${coverage}`.toLowerCase();
  const mentionsStipend = /stipend|allowance|living|accommodation|laptop|insurance/.test(text);
  const isFull = /100\s*%|full tuition|full scholarship|fully funded/.test(text);

  if (isFull && mentionsStipend) return "Full Tuition + Stipend";
  if (isFull) return "100% Full Tuition";
  if (/\$[\d,]+/.test(text)) return "Tuition Discount (Up to $5,000)";
  return "Partial Tuition (20% - 75%)";
};

const toCoveragePercent = (amount: string): number | undefined => {
  const match = amount.match(/(\d{1,3})\s*%/);
  if (match) return Number(match[1]);
  return /full tuition|fully funded/i.test(amount) ? 100 : undefined;
};

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

/**
 * The spreadsheet's Image column holds links to Facebook *posts*, not image
 * files — 17 of 26 rows. Using them as an `<img>` src renders a broken image
 * on every card, so a URL is only accepted when it points at a real file.
 *
 * Curated artwork keeps coming from the static dataset, matched by title. That
 * file is no longer the source of truth for scholarship *data*; it survives as
 * a presentation asset until the sheet carries real image links.
 */
const CURATED_IMAGES = new Map(
  SCHOLARSHIPS_DATA.map(s => [s.title.trim().toLowerCase(), s.image])
);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80";

const IMAGE_FILE = /\.(jpe?g|png|webp|gif|avif)(\?|$)/i;

/**
 * Facebook and Instagram CDN links are signed and expire within days, and the
 * CDN refuses hotlinks — the ÆON card showed a broken image because the sheet
 * holds one. Treat them as no image rather than a broken one.
 */
const EXPIRING_IMAGE_HOST = /(^|\.)(fbcdn\.net|cdninstagram\.com|fbsbx\.com)$/i;

const usableImage = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      !EXPIRING_IMAGE_HOST.test(parsed.hostname) &&
      IMAGE_FILE.test(parsed.pathname + parsed.search)
    );
  } catch {
    return false;
  }
};

const isExpiringHost = (url: string): boolean => {
  try {
    return EXPIRING_IMAGE_HOST.test(new URL(url).hostname);
  } catch {
    return true;
  }
};

const toImage = (row: ApiScholarship): string => {
  // The curated file holds one of these Facebook links too (the ÆON card).
  // Curated Unsplash URLs carry no file extension, so only the host is checked.
  const curated = CURATED_IMAGES.get(row.title.trim().toLowerCase());
  if (curated && !isExpiringHost(curated)) return curated;
  if (row.image_url && usableImage(row.image_url)) return row.image_url;
  return FALLBACK_IMAGE;
};

/* ------------------------------------------------------------------ */
/* Scholarships                                                        */
/* ------------------------------------------------------------------ */

export const toScholarshipView = (row: ApiScholarship): ScholarshipView => ({
  // The page keys on string ids; the backend's integer id becomes the URL.
  id: String(row.id),
  apiId: row.id,
  title: row.title,
  provider: row.provider,
  degreeLevel: row.degree_level || "Bachelor",
  category: toCategory(row.provider_type),
  coverage: toCoverageBand(row.amount, row.coverage),
  coveragePercent: toCoveragePercent(row.amount),
  targetMajors: toList(row.field_of_study),
  eligibility: toBullets(row.eligibility),
  benefits: toBullets(row.coverage),
  requiredDocuments: row.documents ?? [],
  deadline: formatDeadline(row.deadline, row.deadline_note),
  applicationProcess: toBullets(row.application_process),
  officialSource: row.source_url || row.application_link || "",
  image: toImage(row),
  // Kept for components that still read the boolean; `infoCheck` is richer and
  // is what the verification UI should use — it can express "flagged".
  isVerified: row.verified_status === "verified",
  lastVerified: formatLastVerified(row.last_verified),

  infoCheck: row.infoCheck,
  coverageText: row.coverage,
  deadlineNote: row.deadline_note
});

export const toScholarshipViews = (rows: ApiScholarship[]): ScholarshipView[] =>
  rows.map(toScholarshipView);

/** Same-category scholarships, excluding the one being viewed. */
export const relatedScholarships = (
  all: ScholarshipView[],
  current: ScholarshipView,
  limit = 3
): ScholarshipView[] => {
  const sameCategory = all.filter(s => s.id !== current.id && s.category === current.category);
  const others = all.filter(s => s.id !== current.id && s.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
};
