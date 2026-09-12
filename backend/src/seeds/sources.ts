import fs from 'fs';
import path from 'path';
import { LoadedSheet, SheetRow, loadWorkbookDir } from './excel';
import {
  assessSafety,
  buildLookup,
  classifyProvider,
  classifySource,
  deriveAmount,
  deriveVerifiedStatus,
  hostnameOf,
  normalizeUrl,
  orNull,
  parseDate,
  readField,
  splitList
} from './mapping';

/**
 * Where the source spreadsheets live. Drop .xlsx files here and re-seed.
 * SEED_DATA_DIR overrides it (useful in Docker or CI).
 */
export const DATA_DIR = process.env.SEED_DATA_DIR
  ? path.resolve(process.env.SEED_DATA_DIR)
  : path.join(__dirname, 'data');

/** Scholarships come from Cambodia-focused sheets that carry no country column. */
const DEFAULT_COUNTRY = 'Cambodia';

/* ------------------------------------------------------------------ */
/* Column aliases                                                      */
/* ------------------------------------------------------------------ */

const CAREER_ALIASES: Record<string, string[]> = {
  title: ['Career', 'Career Name', 'Job Title'],
  category: ['Category', 'Field', 'Sector'],
  description: ['short overview', 'Overview', 'Description'],
  responsibilities: ['What You Do', 'Responsibilities', 'Day to Day'],
  related_majors: ['Related Majors', 'Majors'],
  required_skills: ['Key Skills', 'Skills', 'Required Skills'],
  education_required: ['Education Required', 'Education'],
  personality_fit: ['Best-Fit Personality', 'Personality', 'Suit personality'],
  growth_outlook: ['Job-Market Demand', 'Demand', 'Growth Outlook', 'Outlook'],
  average_salary: ['Average Salary', 'Salary'],
  source: ['Source'],
  source_url: ['Source URL', 'Official Site', 'Link']
};

const MAJOR_ALIASES: Record<string, string[]> = {
  name: ['Major', 'Major Name', 'Programme', 'Program'],
  field: ['Category', 'Field', 'Discipline'],
  description: ['Description', 'Overview', 'short overview'],
  subjects: ['What Students Study (subjects)', 'What Students Study', 'Subjects'],
  personality_fit: ['Suit personality', 'Best-Fit Personality', 'Personality'],
  related_careers: ['Careers', 'Related Careers'],
  universities: ['Universities', 'Offered At', 'Where to Study'],
  job_market_demand: ['Job-Market Demand', 'Demand', 'Outlook'],
  related_scholarships: ['Scholarships offer relate to this major', 'Related Scholarships', 'Scholarships'],
  duration: ['Duration', 'Length'],
  degree_type: ['Degree Type', 'Degree'],
  source: ['Source'],
  source_url: ['Source URL', 'Official Site', 'Link']
};

const SCHOLARSHIP_ALIASES: Record<string, string[]> = {
  title: ['Scholarship name', 'Scholarship Name', 'Program', 'Program Name'],
  provider: ['Provider', 'Univeristy', 'University', 'Funder', 'Host/Provider', 'Host', 'Institution'],
  degree_level: ['Degree level', 'Level', 'Study Level'],
  field_of_study: ['Major', 'Field of Study', 'Field Fit (Data Sci/Tech)', 'Field Fit (Data Sci/ML)', 'Field Fit', 'Field'],
  eligibility: ['Eligibility', 'Eligibility Summary', 'Key Eligibility'],
  coverage: ['Benefits', 'Coverage / Benefits', 'Funding Coverage', 'What It Offers', 'Coverage'],
  documents: ['Documents', 'Required Documents'],
  deadline: ['Deadline', 'Deadline / Status', 'Typical Deadline', 'Typical Timing'],
  application_process: ['Application process', 'How to apply'],
  url: ['Official source', 'Source URL', 'Official Site', 'Link', 'Website'],
  image_url: ['Image (pls copy and paste from those link)', 'Image', 'Image URL'],
  verification_status: ['Verification status'],
  last_verified: ['Last verified'],
  country: ['Host Country/Region', 'Host Country', 'Country', 'Region'],
  funding: ['Award Type', 'Funding'],
  opening: ['Opening Window', 'Opening']
};

const CAREER = buildLookup(CAREER_ALIASES);
const MAJOR = buildLookup(MAJOR_ALIASES);
const SCHOLARSHIP = buildLookup(SCHOLARSHIP_ALIASES);

/** Union of every accepted header, used to locate the header row in a sheet. */
export const HEADER_HINTS = [
  ...Object.values(CAREER_ALIASES).flat(),
  ...Object.values(MAJOR_ALIASES).flat(),
  ...Object.values(SCHOLARSHIP_ALIASES).flat()
];

/* ------------------------------------------------------------------ */
/* Sheet routing                                                       */
/* ------------------------------------------------------------------ */

export type EntityKind = 'scholarship' | 'career' | 'major';

/**
 * Every workbook names its tab "Sheet1", so the entity is decided by which
 * title column the sheet has, not by file or sheet name. Order matters: the
 * scholarship sheet also has a "Major" column, so it must be tested first.
 * ("Careers", plural, is a majors column and does not collide with "Career".)
 */
const ROUTES: Array<[EntityKind, string[]]> = [
  ['scholarship', SCHOLARSHIP.title],
  ['career', CAREER.title],
  ['major', MAJOR.name]
];

export const routeSheet = (sheet: LoadedSheet): EntityKind | null => {
  for (const [kind, titleKeys] of ROUTES) {
    if (titleKeys.some(key => sheet.headers.includes(key))) return kind;
  }
  return null;
};

/* ------------------------------------------------------------------ */
/* Careers                                                             */
/* ------------------------------------------------------------------ */

export interface CareerSeed {
  title: string;
  category: string;
  description: string;
  responsibilities: string | null;
  average_salary: string | null;
  growth_outlook: string | null;
  education_required: string | null;
  personality_fit: string | null;
  required_skills: string[];
  related_majors: string[];
  source: string | null;
  source_url: string | null;
}

const mapCareer = (row: SheetRow): CareerSeed | null => {
  const title = readField(row, CAREER, 'title');
  if (!title) return null;

  const overview = readField(row, CAREER, 'description');
  const responsibilities = readField(row, CAREER, 'responsibilities');

  return {
    title,
    category: readField(row, CAREER, 'category') || 'Uncategorized',
    // Fall back to the one-line summary when there is no long overview.
    description: overview || responsibilities || 'No description in source sheet.',
    responsibilities: orNull(responsibilities),
    // Not present in the current sheet — stored as NULL rather than invented.
    average_salary: orNull(readField(row, CAREER, 'average_salary')),
    growth_outlook: orNull(readField(row, CAREER, 'growth_outlook')),
    education_required: orNull(readField(row, CAREER, 'education_required')),
    personality_fit: orNull(readField(row, CAREER, 'personality_fit')),
    required_skills: splitList(readField(row, CAREER, 'required_skills')),
    related_majors: splitList(readField(row, CAREER, 'related_majors')),
    source: orNull(readField(row, CAREER, 'source')),
    source_url: orNull(normalizeUrl(readField(row, CAREER, 'source_url')))
  };
};

/* ------------------------------------------------------------------ */
/* Majors                                                              */
/* ------------------------------------------------------------------ */

export interface MajorSeed {
  name: string;
  field: string;
  description: string;
  duration: string | null;
  degree_type: string | null;
  subjects: string[];
  personality_fit: string | null;
  job_market_demand: string | null;
  related_careers: string[];
  universities: string[];
  related_scholarships: string[];
  source: string | null;
  source_url: string | null;
}

const mapMajor = (row: SheetRow): MajorSeed | null => {
  const name = readField(row, MAJOR, 'name');
  if (!name) return null;

  return {
    name,
    field: readField(row, MAJOR, 'field') || 'Uncategorized',
    description: readField(row, MAJOR, 'description') || 'No description in source sheet.',
    // Not present in the current sheet — stored as NULL rather than invented.
    duration: orNull(readField(row, MAJOR, 'duration')),
    degree_type: orNull(readField(row, MAJOR, 'degree_type')),
    subjects: splitList(readField(row, MAJOR, 'subjects')),
    personality_fit: orNull(readField(row, MAJOR, 'personality_fit')),
    job_market_demand: orNull(readField(row, MAJOR, 'job_market_demand')),
    related_careers: splitList(readField(row, MAJOR, 'related_careers')),
    universities: splitList(readField(row, MAJOR, 'universities')),
    related_scholarships: splitList(readField(row, MAJOR, 'related_scholarships')),
    source: orNull(readField(row, MAJOR, 'source')),
    source_url: orNull(normalizeUrl(readField(row, MAJOR, 'source_url')))
  };
};

/* ------------------------------------------------------------------ */
/* Scholarships                                                        */
/* ------------------------------------------------------------------ */

export type OpportunityType = 'scholarship' | 'exchange' | 'internship';

/**
 * Where a workbook splits opportunity kinds across tabs, the tab name decides.
 * A sheet's own "Award Type" column describes funding level, not programme kind.
 */
const opportunityTypeFor = (sheetName: string): OpportunityType => {
  const name = sheetName.toLowerCase();
  if (/intern|research|summer/.test(name)) return 'internship';
  if (/exchange|mobility/.test(name)) return 'exchange';
  return 'scholarship';
};

const KIND_NOUN: Record<OpportunityType, string> = {
  scholarship: 'scholarship',
  exchange: 'exchange programme',
  internship: 'research internship'
};

export interface ScholarshipSeed {
  title: string;
  provider: string;
  provider_type: string;
  description: string;
  amount: string;
  coverage: string;
  eligibility: string;
  degree_level: string | null;
  field_of_study: string | null;
  documents: string[];
  application_process: string | null;
  deadline: Date | null;
  deadline_note: string | null;
  application_link: string;
  image_url: string | null;
  country: string;
  opportunity_type: OpportunityType;
  source: string;
  source_url: string;
  source_type: string;
  verified_status: string;
  last_verified: Date | null;
  safety_warnings: string[];
}

const buildScholarshipDescription = (
  kind: OpportunityType,
  parts: { funding: string; country: string; provider: string; level: string; field: string; opening: string }
): string => {
  const funding = parts.funding ? `${parts.funding} ` : '';
  const where = parts.country && parts.country !== 'Unknown' ? ` in ${parts.country}` : '';
  const by = parts.provider ? ` offered by ${parts.provider}` : '';

  const lead = `${funding}${KIND_NOUN[kind]}${where}${by}.`;
  const sentences = [lead.charAt(0).toUpperCase() + lead.slice(1)];

  if (parts.level) sentences.push(`Study level: ${parts.level}.`);
  if (parts.field) sentences.push(`Field focus: ${parts.field}.`);
  if (parts.opening) sentences.push(`Applications typically open: ${parts.opening}.`);
  return sentences.join(' ');
};

const mapScholarship = (row: SheetRow, sheet: LoadedSheet): ScholarshipSeed | null => {
  const title = readField(row, SCHOLARSHIP, 'title');
  if (!title) return null;

  const kind = opportunityTypeFor(sheet.sheet);
  const provider = readField(row, SCHOLARSHIP, 'provider') || 'Not stated in source sheet';
  const rawUrl = readField(row, SCHOLARSHIP, 'url');
  const url = normalizeUrl(rawUrl);
  const coverage = readField(row, SCHOLARSHIP, 'coverage');
  const deadlineText = readField(row, SCHOLARSHIP, 'deadline');
  const deadline = parseDate(deadlineText);
  const level = readField(row, SCHOLARSHIP, 'degree_level');
  const field = readField(row, SCHOLARSHIP, 'field_of_study');

  const country = readField(row, SCHOLARSHIP, 'country') || DEFAULT_COUNTRY;

  const sourceType = classifySource(url);
  const warnings = assessSafety(url, rawUrl, sourceType);

  // The sheet has a Verification status column but leaves it blank; honour it
  // when filled, otherwise fall back to the offline checks.
  const sheetStatus = readField(row, SCHOLARSHIP, 'verification_status');

  return {
    title,
    provider,
    provider_type: classifyProvider(provider),
    description: buildScholarshipDescription(kind, {
      funding: readField(row, SCHOLARSHIP, 'funding'),
      country,
      provider,
      level,
      field,
      opening: readField(row, SCHOLARSHIP, 'opening')
    }),
    amount: deriveAmount(readField(row, SCHOLARSHIP, 'funding'), coverage),
    coverage: coverage || 'See official site',
    eligibility: readField(row, SCHOLARSHIP, 'eligibility') || 'See official site',
    degree_level: orNull(level),
    field_of_study: orNull(field),
    documents: splitList(readField(row, SCHOLARSHIP, 'documents')),
    application_process: orNull(readField(row, SCHOLARSHIP, 'application_process')),
    deadline,
    // Keep the raw text only when it was not a parseable date.
    deadline_note: deadline ? null : orNull(deadlineText),
    application_link: url,
    image_url: orNull(normalizeUrl(readField(row, SCHOLARSHIP, 'image_url'))),
    country,
    opportunity_type: kind,
    source: hostnameOf(url) || provider,
    source_url: url,
    source_type: sourceType,
    verified_status: sheetStatus || deriveVerifiedStatus(url, warnings),
    last_verified: parseDate(readField(row, SCHOLARSHIP, 'last_verified')),
    safety_warnings: warnings
  };
};

/* ------------------------------------------------------------------ */
/* Import                                                              */
/* ------------------------------------------------------------------ */

export interface SheetSummary {
  file: string;
  sheet: string;
  entity: EntityKind | 'unrecognized';
  imported: number;
  skipped: number;
}

/* ------------------------------------------------------------------ */
/* Universities                                                        */
/* ------------------------------------------------------------------ */

export interface UniversitySeed {
  slug: string | null;
  name: string;
  short_name: string | null;
  country: string;
  city: string;
  type: string | null;
  ranking: number | null;
  description: string;
  website: string;
  phone: string | null;
  established: string | null;
  student_count: string | null;
  image_url: string | null;
  tuition_range: string | null;
  acceptance_rate: string | null;
  programs: string[];
  scholarships: string[];
  source: string;
  source_url: string;
}

/** Universities have no source workbook; they come from a JSON file instead. */
export const UNIVERSITIES_FILE = 'universities.json';

/**
 * The university dataset was written for the frontend and lives in
 * `data/universities.json`. Reading it here keeps every seeded entity coming
 * from the same directory, editable without touching code.
 */
export const importUniversities = (dir = DATA_DIR): UniversitySeed[] => {
  const file = path.join(dir, UNIVERSITIES_FILE);
  if (!fs.existsSync(file)) return [];

  const rows = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<UniversitySeed>[];

  return rows
    .filter(row => row.name)
    .map(row => ({
      slug: row.slug ?? null,
      name: row.name as string,
      short_name: row.short_name ?? null,
      country: row.country || 'Cambodia',
      city: row.city || 'Phnom Penh',
      type: row.type ?? null,
      // Not in the dataset — null rather than an invented figure.
      ranking: row.ranking ?? null,
      description: row.description || 'No description in source data.',
      website: row.website || '',
      phone: row.phone ?? null,
      established: row.established ?? null,
      student_count: row.student_count ?? null,
      image_url: row.image_url ?? null,
      tuition_range: row.tuition_range ?? null,
      acceptance_rate: row.acceptance_rate ?? null,
      programs: row.programs ?? [],
      scholarships: row.scholarships ?? [],
      source: hostnameOf(row.website || '') || row.name as string,
      source_url: row.source_url || row.website || ''
    }));
};

export interface ImportResult {
  careers: CareerSeed[];
  majors: MajorSeed[];
  scholarships: ScholarshipSeed[];
  universities: UniversitySeed[];
  sheets: SheetSummary[];
}

/** Read every workbook in `dir`, routing each sheet to the entity it describes. */
export const importAll = async (dir = DATA_DIR): Promise<ImportResult> => {
  const sheets = await loadWorkbookDir(dir, { headerHints: HEADER_HINTS });

  const result: ImportResult = {
    careers: [],
    majors: [],
    scholarships: [],
    universities: importUniversities(dir),
    sheets: []
  };

  for (const sheet of sheets) {
    const entity = routeSheet(sheet);
    if (!entity) {
      result.sheets.push({
        file: sheet.file,
        sheet: sheet.sheet,
        entity: 'unrecognized',
        imported: 0,
        skipped: sheet.rows.length
      });
      continue;
    }

    let imported = 0;
    for (const row of sheet.rows) {
      if (entity === 'career') {
        const record = mapCareer(row);
        if (!record) continue;
        result.careers.push(record);
      } else if (entity === 'major') {
        const record = mapMajor(row);
        if (!record) continue;
        result.majors.push(record);
      } else {
        const record = mapScholarship(row, sheet);
        if (!record) continue;
        result.scholarships.push(record);
      }
      imported++;
    }

    result.sheets.push({
      file: sheet.file,
      sheet: sheet.sheet,
      entity,
      imported,
      skipped: sheet.rows.length - imported
    });
  }

  return result;
};
