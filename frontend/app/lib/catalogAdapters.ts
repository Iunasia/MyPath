/**
 * Catalog adapters — careers, majors, universities.
 *
 * Same split as the scholarship adapter: the **API decides which records exist
 * and what they say**, while the curated static files supply presentation
 * assets (icons, hero images, colour tokens) matched by name. Those files are
 * no longer a data source; they are a design asset until the spreadsheets carry
 * equivalents.
 */
import type { LucideIcon } from "lucide-react";
import { GraduationCap, Briefcase, Building2 } from "lucide-react";
import { CAREERS_DATA, CAREER_CATEGORIES } from "@/app/data/careers";
import { MAJORS_DATA, CATEGORIES as MAJOR_CATEGORIES, type LearnItem } from "@/app/data/majors";
import { UNIVERSITIES_DATA } from "@/app/data/universities";
import type { ApiCareer, ApiMajor, ApiUniversity } from "./api";

/* ------------------------------------------------------------------ */
/* Matching helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Spreadsheet categories carry an emoji prefix ("💻 Technology & Digital")
 * that the curated files don't, and punctuation drifts between the two
 * ("Arts & Design" vs "Arts, Design & Media"). Reduce both to letters and
 * digits before comparing.
 */
const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

/** The emoji-free label, for matching; display keeps the original. */
export const plainCategory = (value: string): string =>
  value.replace(/^[^\p{L}\p{N}]+/u, "").trim();

/**
 * Abbreviations the sheets use for majors ("Bachelor's in CS, IT, …"). Without
 * these, "CS" fell through to the containment match below and landed on
 * "Economi*cs*".
 */
const ABBREVIATIONS: Record<string, string> = {
  cs: "computerscience",
  it: "informationtechnology",
  ai: "artificialintelligence",
  bis: "businessinformationsystems",
  ir: "internationalrelations",
};

/** Shorter than this, a name is an abbreviation — never a substring match. */
const MIN_PARTIAL = 4;

/** University names the majors sheet writes differently from our short names. */
const UNIVERSITY_ALIASES: Record<string, string> = {
  dmucambodia: "dmuc",
};

/** "AUPP-related digital programs", "AUPP/ICT-related programs" → AUPP. */
const startsWithShortName = (name: string, shortName: string): boolean => {
  if (!shortName) return false;
  const escaped = shortName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}[\\s\\-/]`, "i").test(name);
};

const findByName = <T extends { name?: string; title?: string }>(
  list: T[],
  name: string
): T | undefined => {
  const raw = normalize(name);
  const target = ABBREVIATIONS[raw] ?? raw;
  if (!target) return undefined;

  const exact = list.find(item => normalize(item.name ?? item.title ?? "") === target);
  if (exact) return exact;
  if (target.length < MIN_PARTIAL) return undefined;

  // Fall back to a containment match so "Computer Science" still finds
  // "Computer Science (Software Engineering)". When several contain it, take
  // the closest in length: "University of Cambodia" is inside both "The
  // University of Cambodia" and "Paññāsāstra University of Cambodia", and
  // taking the first in the list linked students to the wrong university.
  let best: T | undefined;
  let bestGap = Infinity;
  for (const item of list) {
    const candidate = normalize(item.name ?? item.title ?? "");
    if (candidate.length < MIN_PARTIAL || !(candidate.includes(target) || target.includes(candidate))) continue;

    const gap = Math.abs(candidate.length - target.length);
    if (gap < bestGap) {
      best = item;
      bestGap = gap;
    }
  }
  return best;
};

/* ------------------------------------------------------------------ */
/* Careers                                                             */
/* ------------------------------------------------------------------ */

export interface RelatedLink {
  id: string;
  name: string;
  icon: LucideIcon;
}

export interface CareerView {
  id: string;
  title: string;
  category: string;
  /** Emoji stripped — use for filtering and matching. */
  categoryKey: string;
  shortOverview: string;
  description: string;
  whatYouDo: string;
  icon: LucideIcon;
  relatedMajorsText: string[];
  keySkills: string[];
  educationRequired: string;
  bestFitPersonality: string[];
  jobMarketDemand: string;
  source: string | null;
  sourceUrl: string | null;
}

const careerIcon = (row: ApiCareer): LucideIcon => {
  const curated = findByName(CAREERS_DATA, row.title);
  if (curated) return curated.icon;

  const category = CAREER_CATEGORIES.find(
    c => normalize(c.id) === normalize(plainCategory(row.category))
  );
  return category?.icon ?? Briefcase;
};

/** Personality/skills cells are comma-separated in the spreadsheet. */
const splitTraits = (value: string | null): string[] =>
  (value ?? "")
    .split(/[;,\n]+/)
    .map(part => part.trim())
    .filter(Boolean);

export const toCareerView = (row: ApiCareer): CareerView => ({
  id: String(row.id),
  title: row.title,
  category: row.category,
  categoryKey: plainCategory(row.category),
  // The sheet has one overview; the curated file split it into two lengths.
  shortOverview: row.description,
  description: row.description,
  whatYouDo: row.responsibilities ?? "",
  icon: careerIcon(row),
  relatedMajorsText: row.related_majors ?? [],
  keySkills: row.required_skills ?? [],
  educationRequired: row.education_required ?? "Not stated in source",
  bestFitPersonality: splitTraits(row.personality_fit),
  jobMarketDemand: row.growth_outlook ?? "Not stated",
  source: row.source,
  sourceUrl: row.source_url,
});

export const toCareerViews = (rows: ApiCareer[]): CareerView[] => rows.map(toCareerView);

/* ------------------------------------------------------------------ */
/* Majors                                                              */
/* ------------------------------------------------------------------ */

export interface MajorView {
  id: string;
  name: string;
  category: string;
  categoryKey: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  heroImage: string;
  tags: string[];
  subjects: string[];
  duration: string | null;
  degreeType: string | null;
  personalityFit: string[];
  jobMarketDemand: string;
  relatedCareersText: string[];
  universitiesText: string[];
  relatedScholarshipsText: string[];
  source: string | null;
  sourceUrl: string | null;

  /* Curated extras — present only when the name matches a record in the
     designed dataset. The spreadsheet has no equivalent columns yet, so these
     degrade to a plain list built from `subjects` rather than disappearing. */
  extendedDescription: string | null;
  whatYouLearn: LearnItem[];
  skillsDeveloped: string[];
  careerOpportunities: string;
}

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80";

export const toMajorView = (row: ApiMajor): MajorView => {
  const curated = findByName(MAJORS_DATA, row.name);
  const category = MAJOR_CATEGORIES.find(
    c => normalize(c.id) === normalize(row.field)
  );

  return {
    id: String(row.id),
    name: row.name,
    category: row.field,
    categoryKey: plainCategory(row.field),
    description: row.description,
    icon: curated?.icon ?? category?.icon ?? GraduationCap,
    iconBg: curated?.iconBg ?? category?.bg ?? "bg-sitomo",
    iconColor: curated?.iconColor ?? category?.iconColor ?? "text-sky-deep",
    heroImage: curated?.heroImage ?? FALLBACK_HERO,
    tags: curated?.tags ?? (row.subjects ?? []).slice(0, 4),
    subjects: row.subjects ?? [],
    duration: row.duration,
    degreeType: row.degree_type,
    personalityFit: splitTraits(row.personality_fit),
    jobMarketDemand: row.job_market_demand ?? "Not stated",
    relatedCareersText: row.related_careers ?? [],
    universitiesText: row.universities ?? [],
    relatedScholarshipsText: row.related_scholarships ?? [],
    source: row.source,
    sourceUrl: row.source_url,

    extendedDescription: curated?.extendedDescription ?? null,
    // Fall back to the spreadsheet's subject list, each rendered as a plain
    // item, so an unmatched major still shows what students study.
    whatYouLearn:
      curated?.whatYouLearn ??
      (row.subjects ?? []).map(subject => ({
        title: subject,
        description: "",
        icon: category?.icon ?? GraduationCap,
      })),
    skillsDeveloped: curated?.skillsDeveloped ?? row.subjects ?? [],
    careerOpportunities: curated?.careerOpportunities ?? "",
  };
};

export const toMajorViews = (rows: ApiMajor[]): MajorView[] => rows.map(toMajorView);

/* ------------------------------------------------------------------ */
/* Universities                                                        */
/* ------------------------------------------------------------------ */

export interface UniversityView {
  /** Slug when the record has one, otherwise the numeric id — both route. */
  id: string;
  apiId: number;
  name: string;
  shortName: string;
  location: string;
  type: string;
  description: string;
  website: string;
  phone: string | null;
  established: string | null;
  studentCount: string | null;
  tuitionFee: string | null;
  image: string;
  popularMajors: string[];
  scholarshipsList: string[];
}

const FALLBACK_CAMPUS =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80";

export const toUniversityView = (row: ApiUniversity): UniversityView => {
  const curated = row.slug
    ? UNIVERSITIES_DATA.find(u => u.id === row.slug)
    : findByName(UNIVERSITIES_DATA, row.name);

  return {
    id: row.slug ?? String(row.id),
    apiId: row.id,
    name: row.name,
    shortName: row.short_name ?? curated?.shortName ?? row.name,
    location: row.city,
    type: row.type ?? curated?.type ?? "University",
    description: row.description,
    website: row.website,
    phone: row.phone,
    established: row.established,
    studentCount: row.student_count,
    tuitionFee: row.tuition_range,
    // The dataset's image_url is a real file; curated art wins when present.
    image: curated?.image ?? row.image_url ?? FALLBACK_CAMPUS,
    popularMajors: row.programs ?? [],
    scholarshipsList: row.scholarships ?? [],
  };
};

export const toUniversityViews = (rows: ApiUniversity[]): UniversityView[] =>
  rows.map(toUniversityView);

/* ------------------------------------------------------------------ */
/* Cross-entity links                                                  */
/* ------------------------------------------------------------------ */

/**
 * Relationships are stored as plain names ("Computer Science"), not foreign
 * keys, so a link is only produced when the name resolves to a real record.
 * Unmatched names are returned separately rather than rendered as dead links.
 */
export const linkMajors = (
  names: string[],
  majors: MajorView[]
): { links: RelatedLink[]; unmatched: string[] } => {
  const links: RelatedLink[] = [];
  const unmatched: string[] = [];

  for (const name of names) {
    const match = findByName(majors, name);
    // Two names can resolve to one record ("CS" and "Computer Science").
    if (match && !links.some(l => l.id === match.id)) links.push({ id: match.id, name: match.name, icon: match.icon });
    else if (!match) unmatched.push(name);
  }
  return { links, unmatched };
};

export const linkCareers = (
  names: string[],
  careers: CareerView[]
): { links: RelatedLink[]; unmatched: string[] } => {
  const links: RelatedLink[] = [];
  const unmatched: string[] = [];

  for (const name of names) {
    const match = findByName(
      careers.map(c => ({ ...c, name: c.title })),
      name
    );
    if (match && !links.some(l => l.id === match.id)) links.push({ id: match.id, name: match.title, icon: match.icon });
    else if (!match) unmatched.push(name);
  }
  return { links, unmatched };
};

export const linkUniversities = (
  names: string[],
  universities: UniversityView[]
): { links: Array<{ id: string; name: string }>; unmatched: string[] } => {
  const links: Array<{ id: string; name: string }> = [];
  const unmatched: string[] = [];

  for (const name of names) {
    // The sheet qualifies names — "Paragon.U (MIS)", "AUPP-related digital
    // programs", "DMU Cambodia" — so drop the brackets, then try the short
    // name on its own and as a prefix before falling back to the full name.
    const cleaned = name.replace(/\(.*?\)/g, " ").replace(/\s+/g, " ").trim();
    const key = normalize(cleaned);
    const short = UNIVERSITY_ALIASES[key] ?? key;
    const match =
      universities.find(u => normalize(u.shortName) === short) ??
      universities.find(u => startsWithShortName(cleaned, u.shortName)) ??
      findByName(universities, cleaned);
    if (match && !links.some(l => l.id === match.id)) links.push({ id: match.id, name: match.name });
    else if (!match) unmatched.push(name);
  }
  return { links, unmatched };
};

/** Filter pills, built from the data actually returned rather than a constant. */
export const categoriesOf = <T extends { category: string }>(rows: T[]): string[] =>
  [...new Set(rows.map(r => r.category))].sort((a, b) =>
    plainCategory(a).localeCompare(plainCategory(b))
  );

export { Building2 };
