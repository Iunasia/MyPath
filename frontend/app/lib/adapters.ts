/**
 * Translates backend rows into the shapes the pages already render.
 *
 * The two sides disagree on nearly every convention — snake_case vs camelCase,
 * integer ids vs slugs, ISO timestamps vs display strings, single strings vs
 * bullet arrays. Keeping every conversion here means the page components stay
 * as they were and there is one file to fix when the API moves.
 */
import type { ApiInfoCheck, ApiScholarship } from "./api";
import type { Scholarship } from "@/app/data/scholarships";

/** The view model is the existing page shape plus the DMIL verdict. */
export interface ScholarshipView extends Scholarship {
  /** Numeric backend id, for API calls. */
  apiId: number;
  infoCheck: ApiInfoCheck;
  /** Raw benefits text, when the bullet split is not enough. */
  coverageText: string;
  deadlineNote: string | null;
  /** The raw deadline instant — for sorting and the closed state. */
  deadlineAt: string | null;
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

  // Built from 24-hour parts: Node and browsers disagree on how en-GB writes
  // midnight in 12-hour time ("12:00 am" vs "0:00 am"). Comparing against the
  // string broke the midnight check in the browser, and a server-rendered
  // page then disagreed with the client (a hydration mismatch).
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PHNOM_PENH,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? 0);
  const minute = parts.find(p => p.type === "minute")?.value ?? "00";

  // Midnight is the importer's "no time given" case — show the date alone.
  if (hour === 0 && minute === "00") return day;
  return `${day}, ${hour % 12 || 12}:${minute} ${hour < 12 ? "am" : "pm"}`;
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

export type DeadlineState =
  | { kind: "unknown" }
  | { kind: "closed" }
  | { kind: "open"; daysLeft: number };

/** Midnight UTC of the Phnom Penh calendar day that `time` falls on. */
const phnomPenhDay = (time: number): number =>
  Date.parse(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: PHNOM_PENH,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(time)
  );

/**
 * Whether a deadline has passed and, if not, how many Phnom Penh days are
 * left. It reads the clock, so it lives here rather than in a component body.
 */
export const deadlineState = (iso: string | null): DeadlineState => {
  const at = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(at)) return { kind: "unknown" };
  const now = Date.now();
  if (at <= now) return { kind: "closed" };
  return { kind: "open", daysLeft: Math.round((phnomPenhDay(at) - phnomPenhDay(now)) / 86_400_000) };
};

export const deadlineLabel = (state: DeadlineState): string =>
  state.kind === "closed"
    ? "Closed"
    : state.kind === "unknown"
      ? "No date yet"
      : state.daysLeft === 0
        ? "Closes today"
        : state.daysLeft === 1
          ? "1 day left"
          : `${state.daysLeft} days left`;

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
 * files — every row — so a URL is only accepted when it points at a real file.
 *
 * Otherwise the card shows a photo of the subject from
 * public/images/scholarships (photographers credited in CREDITS.md there).
 * Those are stored in the repo because hotlinked stock photos have 404'd on us
 * twice, blanking every card at once.
 *
 * Specific subjects come first: "Media Arts and Studies" is media, not arts,
 * and "Mathematics – Data Science" is data, not science.
 */
const SUBJECT_PHOTOS: Array<[RegExp, string]> = [
  [/financial need|need-based|community service|social impact/i, "campus"],
  [/architect|interior design|civil engineer/i, "architecture"],
  [/account|finance|financial|audit|banking/i, "accounting"],
  [/data science|mathematic|statistic|analytic/i, "data"],
  [/media|communication|journalis|film|broadcast/i, "media"],
  [/\bai\b|artificial intelligence|cyber|comput|software|\bit\b|ict|digital|web|network/i, "technology"],
  [/engineer|mechanic|electric|technolog/i, "engineering"],
  [/law|legal|public policy|diplomacy|international relation|political/i, "law"],
  [/art|design|drama|music|creative|visual/i, "arts"],
  [/sport|athletic|physical education/i, "sport"],
  [/tourism|hospitality|hotel/i, "tourism"],
  [/biolog|chemis|physic|science|medic|health|pharmac|nursing|agricultur/i, "science"],
  [/business|management|economic|marketing|entrepreneur|commerce/i, "business"],
  [/japanese|english|language|literature|linguist|humanities|education|social science/i, "language"]
];

/** No subject to go on — an entrance or merit award, or a whole-college offer. */
const GENERIC_PHOTO = /exam|entrance|merit|excellence|genius|award/i;

const subjectPhoto = (row: ApiScholarship): string => {
  const find = (text: string) => SUBJECT_PHOTOS.find(([pattern]) => pattern.test(text))?.[1];

  // The first field listed is the award's main subject. Matching the whole
  // list first made every business degree that mentions IT a computer photo,
  // and ITC ("Engineering, Technology, Architecture") an architecture one.
  const firstField = (row.field_of_study ?? "").split(/[;,/]/)[0]?.trim();
  const name =
    (firstField && find(firstField)) ??
    find(`${row.field_of_study ?? ""} ${row.title}`) ??
    (GENERIC_PHOTO.test(row.title) ? "graduation" : "campus");

  return `/images/scholarships/${name}.jpg`;
};

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

const toImage = (row: ApiScholarship): string =>
  row.image_url && usableImage(row.image_url) ? row.image_url : subjectPhoto(row);

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
  deadlineNote: row.deadline_note,
  deadlineAt: row.deadline
});

export const toScholarshipViews = (rows: ApiScholarship[]): ScholarshipView[] =>
  rows.map(toScholarshipView);

const DEADLINE_RANK = { open: 0, unknown: 1, closed: 2 } as const;

/**
 * Open soonest-first, then no date announced, then closed most-recent-first.
 * The API sorts by date alone, which put closed scholarships at the top.
 */
export const sortByDeadline = (rows: ScholarshipView[]): ScholarshipView[] =>
  rows
    .map(row => ({
      row,
      kind: deadlineState(row.deadlineAt).kind,
      at: row.deadlineAt ? Date.parse(row.deadlineAt) : 0
    }))
    .sort(
      (a, b) =>
        DEADLINE_RANK[a.kind] - DEADLINE_RANK[b.kind] ||
        (a.kind === "closed" ? b.at - a.at : a.at - b.at)
    )
    .map(({ row }) => row);

/** Same-category scholarships still open (or undated), excluding the one being viewed. */
export const relatedScholarships = (
  all: ScholarshipView[],
  current: ScholarshipView,
  limit = 3
): ScholarshipView[] => {
  const candidates = all.filter(
    s => s.id !== current.id && deadlineState(s.deadlineAt).kind !== "closed"
  );
  const sameCategory = candidates.filter(s => s.category === current.category);
  const others = candidates.filter(s => s.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
};
