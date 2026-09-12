import { generateInfoCheck, InfoCheck } from './infoCheck';

/**
 * Compare — MVP #5, "compare universities, majors, scholarships".
 *
 * Turns 2–4 records of one type into rows a table can render without knowing
 * the type: one row per field, values lined up in the order the records were
 * asked for. Two things are worked out here rather than in every client —
 * whether the values differ, and which items leave the field blank — because
 * "this one doesn't say" is exactly what a student comparing options should
 * notice.
 *
 * `notes` are the critical-thinking prompts that go with the table: a deadline
 * that has passed, a listing that came from a social media post, information
 * none of the options give.
 */

export const COMPARE_TYPES = ['scholarship', 'university', 'major', 'career'] as const;
export type CompareType = (typeof COMPARE_TYPES)[number];

export const isCompareType = (value: unknown): value is CompareType =>
  typeof value === 'string' && (COMPARE_TYPES as readonly string[]).includes(value);

export const MIN_ITEMS = 2;
export const MAX_ITEMS = 4;

/**
 * How a row's values are shaped, and so how to render them:
 *   text → string | null        list → string[]        number → number | null
 *   date → ISO string | null     url  → string | null
 *   deadline → { date: ISO string | null, note: string | null }
 */
export type FieldKind = 'text' | 'list' | 'number' | 'date' | 'url' | 'deadline';

type Row = Record<string, any>;

interface FieldDef {
  key: string;
  label: string;
  group: string;
  kind: FieldKind;
  /** Set when a blank is worth telling the student about — completes "doesn't list …". */
  missingNoun?: string;
  /** An empty value is good news here (no warnings), not missing information. */
  blankIsFine?: boolean;
  get?: (record: Row) => unknown;
}

export interface CompareItem {
  id: number;
  title: string;
  subtitle: string | null;
  /** Scholarships only — the same panel the detail page shows. */
  infoCheck?: InfoCheck;
}

export interface CompareRow {
  key: string;
  label: string;
  group: string;
  kind: FieldKind;
  /** One value per item, in `items` order. */
  values: unknown[];
  /** True when at least two items say different things (blanks included). */
  differs: boolean;
  /** Ids of the items that leave this field blank. */
  missing: number[];
  /** List rows only: values every item shares, case-insensitively. */
  common?: string[];
}

export interface CompareNote {
  /** The item it's about, or null when it applies to all of them. */
  itemId: number | null;
  level: 'warning' | 'info';
  text: string;
}

export interface Comparison {
  type: CompareType;
  items: CompareItem[];
  rows: CompareRow[];
  notes: CompareNote[];
}

const iso = (value: unknown): string | null =>
  value instanceof Date ? value.toISOString() : typeof value === 'string' && value ? value : null;

const FIELDS: Record<CompareType, FieldDef[]> = {
  scholarship: [
    { key: 'provider', label: 'Provider', group: 'Overview', kind: 'text' },
    { key: 'opportunity_type', label: 'Type', group: 'Overview', kind: 'text' },
    { key: 'degree_level', label: 'Degree level', group: 'Overview', kind: 'text' },
    { key: 'field_of_study', label: 'Field of study', group: 'Overview', kind: 'text' },
    { key: 'country', label: 'Country', group: 'Overview', kind: 'text' },
    { key: 'amount', label: 'Award', group: 'Award', kind: 'text', missingNoun: 'the award amount' },
    { key: 'coverage', label: 'What it covers', group: 'Award', kind: 'text' },
    {
      key: 'deadline',
      label: 'Deadline',
      group: 'Applying',
      kind: 'deadline',
      missingNoun: 'a deadline',
      // Prose like "Not announced" is information, so it travels with the date.
      get: r => ({ date: iso(r.deadline), note: r.deadline_note || null })
    },
    { key: 'eligibility', label: 'Eligibility', group: 'Applying', kind: 'text', missingNoun: 'who is eligible' },
    { key: 'documents', label: 'Documents', group: 'Applying', kind: 'list', missingNoun: 'the documents needed' },
    { key: 'application_process', label: 'How to apply', group: 'Applying', kind: 'text' },
    { key: 'application_link', label: 'Apply at', group: 'Applying', kind: 'url', missingNoun: 'where to apply' },
    { key: 'source', label: 'Source', group: 'Trust', kind: 'text' },
    { key: 'source_type', label: 'Source type', group: 'Trust', kind: 'text' },
    { key: 'verified_status', label: 'Status', group: 'Trust', kind: 'text' },
    { key: 'last_verified', label: 'Last verified', group: 'Trust', kind: 'date', get: r => iso(r.last_verified) },
    { key: 'safety_warnings', label: 'Warnings', group: 'Trust', kind: 'list', blankIsFine: true }
  ],
  university: [
    { key: 'type', label: 'Type', group: 'Overview', kind: 'text' },
    { key: 'city', label: 'City', group: 'Overview', kind: 'text' },
    { key: 'country', label: 'Country', group: 'Overview', kind: 'text' },
    { key: 'established', label: 'Established', group: 'Overview', kind: 'text' },
    { key: 'student_count', label: 'Students', group: 'Overview', kind: 'text' },
    { key: 'tuition_range', label: 'Tuition', group: 'Cost & admission', kind: 'text', missingNoun: 'tuition fees' },
    { key: 'acceptance_rate', label: 'Acceptance rate', group: 'Cost & admission', kind: 'text' },
    { key: 'ranking', label: 'Ranking', group: 'Cost & admission', kind: 'number' },
    { key: 'programs', label: 'Programs', group: 'Study', kind: 'list', missingNoun: 'its programs' },
    { key: 'scholarships', label: 'Scholarships', group: 'Study', kind: 'list' },
    { key: 'website', label: 'Website', group: 'Contact', kind: 'url', missingNoun: 'a website' },
    { key: 'phone', label: 'Phone', group: 'Contact', kind: 'text' },
    { key: 'source', label: 'Source', group: 'Trust', kind: 'text' }
  ],
  major: [
    { key: 'field', label: 'Field', group: 'Overview', kind: 'text' },
    { key: 'degree_type', label: 'Degree', group: 'Overview', kind: 'text' },
    { key: 'duration', label: 'Duration', group: 'Overview', kind: 'text' },
    { key: 'subjects', label: 'Subjects', group: 'What you study', kind: 'list', missingNoun: 'the subjects studied' },
    { key: 'job_market_demand', label: 'Job-market demand', group: 'Outlook', kind: 'text', missingNoun: 'job-market demand' },
    { key: 'related_careers', label: 'Careers', group: 'Outlook', kind: 'list', missingNoun: 'the careers it leads to' },
    { key: 'personality_fit', label: 'Personality fit', group: 'Fit', kind: 'text' },
    { key: 'universities', label: 'Universities', group: 'Where to study', kind: 'list' },
    { key: 'related_scholarships', label: 'Scholarships', group: 'Where to study', kind: 'list' }
  ],
  career: [
    { key: 'category', label: 'Category', group: 'Overview', kind: 'text' },
    { key: 'responsibilities', label: 'Day to day', group: 'Overview', kind: 'text' },
    { key: 'average_salary', label: 'Average salary', group: 'Pay & outlook', kind: 'text', missingNoun: 'an average salary' },
    { key: 'growth_outlook', label: 'Growth outlook', group: 'Pay & outlook', kind: 'text', missingNoun: 'the growth outlook' },
    { key: 'education_required', label: 'Education', group: 'Getting there', kind: 'text' },
    { key: 'required_skills', label: 'Skills', group: 'Getting there', kind: 'list', missingNoun: 'the skills needed' },
    { key: 'related_majors', label: 'Majors', group: 'Getting there', kind: 'list' },
    { key: 'personality_fit', label: 'Personality fit', group: 'Fit', kind: 'text' }
  ]
};

const HEADING: Record<CompareType, (r: Row) => { title: string; subtitle: string | null }> = {
  scholarship: r => ({ title: r.title, subtitle: r.provider || null }),
  university: r => ({ title: r.name, subtitle: [r.type, r.city].filter(Boolean).join(' · ') || null }),
  major: r => ({ title: r.name, subtitle: r.field || null }),
  career: r => ({ title: r.title, subtitle: r.category || null })
};

const isBlank = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.values(value as object).every(isBlank);
  return false;
};

/** Case, spacing and list order don't make two values different. */
const normalize = (value: unknown): string => {
  if (isBlank(value)) return '';
  if (Array.isArray(value)) return JSON.stringify(value.map(v => String(v).trim().toLowerCase()).sort());
  if (typeof value === 'string') return value.trim().toLowerCase();
  return JSON.stringify(value);
};

/** Values present in every list, keeping the first item's spelling. */
const commonValues = (lists: unknown[]): string[] => {
  const arrays = lists.map(list => (Array.isArray(list) ? list.map(String) : []));
  if (arrays.some(list => list.length === 0)) return [];

  const [first, ...rest] = arrays;
  const others = rest.map(list => new Set(list.map(v => v.trim().toLowerCase())));
  return [...new Set(first)].filter(v => others.every(set => set.has(v.trim().toLowerCase())));
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Deadlines are Cambodian local time (UTC+7, no DST), whatever the server's zone. */
const formatDay = (isoString: string): string => {
  const local = new Date(Date.parse(isoString) + 7 * 60 * 60 * 1000);
  return `${local.getUTCDate()} ${MONTHS[local.getUTCMonth()]} ${local.getUTCFullYear()}`;
};

/** Where to fill a gap none of the options cover — it depends on who holds the answer. */
const WHERE_TO_ASK: Record<CompareType, string> = {
  scholarship: 'ask the providers directly',
  university: 'ask the universities directly',
  major: 'ask the universities that teach them',
  career: 'check job listings or another source'
};

const buildNotes = (
  type: CompareType,
  items: CompareItem[],
  rows: CompareRow[],
  records: Row[],
  now: Date
): CompareNote[] => {
  const warnings: CompareNote[] = [];
  const info: CompareNote[] = [];

  if (type === 'scholarship') {
    items.forEach((item, i) => {
      const deadline = iso(records[i].deadline);
      const note = records[i].deadline_note;

      if (deadline && Date.parse(deadline) < now.getTime()) {
        warnings.push({ itemId: item.id, level: 'warning', text: `${item.title} closed on ${formatDay(deadline)}.` });
      } else if (!deadline && note) {
        info.push({
          itemId: item.id,
          level: 'info',
          text: `${item.title} gives its deadline as "${note}" — confirm the date with the provider before planning around it.`
        });
      }

      if (item.infoCheck?.isRisky) {
        const reason = item.infoCheck.reasons[0] ?? 'This listing was flagged during our checks.';
        warnings.push({ itemId: item.id, level: 'warning', text: `${item.title}: ${reason}` });
      }
    });
  }

  for (const field of FIELDS[type]) {
    if (!field.missingNoun) continue;
    const row = rows.find(r => r.key === field.key);
    if (!row || row.missing.length === 0) continue;

    if (row.missing.length === items.length) {
      const none = items.length === 2 ? 'Neither of these lists' : 'None of these list';
      info.push({
        itemId: null,
        level: 'info',
        text: `${none} ${field.missingNoun} — ${WHERE_TO_ASK[type]} before you decide.`
      });
    } else {
      for (const id of row.missing) {
        const title = items.find(item => item.id === id)?.title ?? `#${id}`;
        info.push({ itemId: id, level: 'info', text: `${title} doesn't list ${field.missingNoun}.` });
      }
    }
  }

  return [...warnings, ...info];
};

/**
 * `records` must already be in the order the student chose. Pass `now` to pin
 * "has this deadline passed?" in tests.
 */
export const buildComparison = (type: CompareType, records: object[], now: Date = new Date()): Comparison => {
  const rowsIn = records as Row[];

  const items: CompareItem[] = rowsIn.map(record => ({
    id: record.id,
    ...HEADING[type](record),
    ...(type === 'scholarship' ? { infoCheck: generateInfoCheck(record) } : {})
  }));

  const rows: CompareRow[] = FIELDS[type].map(field => {
    const values = rowsIn.map(record => (field.get ? field.get(record) : record[field.key] ?? null));
    const row: CompareRow = {
      key: field.key,
      label: field.label,
      group: field.group,
      kind: field.kind,
      values,
      differs: new Set(values.map(normalize)).size > 1,
      missing: field.blankIsFine ? [] : items.filter((_, i) => isBlank(values[i])).map(item => item.id)
    };
    if (field.kind === 'list') row.common = commonValues(values);
    return row;
  });

  return { type, items, rows, notes: buildNotes(type, items, rows, rowsIn, now) };
};
