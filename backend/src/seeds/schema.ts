import type { Pool } from 'pg';

/**
 * The database shape, in one place so the seeder and the test harness cannot
 * drift apart. Safe to run against an existing database: every statement is
 * idempotent.
 */

const TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    auth_provider TEXT NOT NULL DEFAULT 'local',
    google_id TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount TEXT NOT NULL,
    coverage TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    degree_level TEXT,
    field_of_study TEXT,
    documents TEXT[] NOT NULL DEFAULT '{}',
    application_process TEXT,
    deadline TIMESTAMPTZ,
    deadline_note TEXT,
    application_link TEXT NOT NULL,
    image_url TEXT,
    country TEXT NOT NULL,
    opportunity_type TEXT NOT NULL DEFAULT 'scholarship',
    source TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    verified_status TEXT NOT NULL,
    last_verified TIMESTAMPTZ,
    safety_warnings TEXT[] NOT NULL DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS careers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    average_salary TEXT,
    growth_outlook TEXT,
    education_required TEXT,
    personality_fit TEXT,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    related_majors TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    source_url TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS majors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    field TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT,
    degree_type TEXT,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    personality_fit TEXT,
    job_market_demand TEXT,
    related_careers TEXT[] NOT NULL DEFAULT '{}',
    universities TEXT[] NOT NULL DEFAULT '{}',
    related_scholarships TEXT[] NOT NULL DEFAULT '{}',
    source TEXT,
    source_url TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    short_name TEXT,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT,
    ranking INTEGER,
    description TEXT NOT NULL,
    website TEXT NOT NULL,
    phone TEXT,
    established TEXT,
    student_count TEXT,
    image_url TEXT,
    tuition_range TEXT,
    acceptance_rate TEXT,
    programs TEXT[] NOT NULL DEFAULT '{}',
    scholarships TEXT[] NOT NULL DEFAULT '{}',
    source TEXT NOT NULL,
    source_url TEXT NOT NULL
  )`,
  /**
   * Students save majors, careers and universities as well as scholarships,
   * so the saved list is polymorphic. `item_id` is deliberately not a foreign
   * key — it points at a different table depending on `item_type`, and the
   * route validates the target exists before inserting.
   */
  `CREATE TABLE IF NOT EXISTS saved_items (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('scholarship', 'major', 'career', 'university')),
    item_id INTEGER NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, item_type, item_id)
  )`,
  `CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scholarship_id INTEGER NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    reason TEXT NOT NULL
  )`,
  /**
   * "Is this scholarship real?" — a student asks us to check something.
   *
   * `scholarship_id` is nullable on purpose: the important case is a link seen
   * on social media that is NOT in our catalogue. `submitted_url` carries that.
   * Both reference columns are ON DELETE SET NULL so a re-seed or a deleted
   * account never destroys the request history.
   */
  `CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    scholarship_id INTEGER REFERENCES scholarships(id) ON DELETE SET NULL,
    submitted_url TEXT,
    submitted_title TEXT NOT NULL,
    note TEXT,
    auto_check JSONB,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'reviewing', 'resolved')),
    verdict TEXT
      CHECK (verdict IS NULL OR verdict IN ('legitimate', 'scam', 'outdated', 'unverifiable')),
    admin_response TEXT,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    read_by_user BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`
];

/**
 * CREATE TABLE IF NOT EXISTS leaves an already-created table untouched, so
 * databases made before a column was added need it bolted on explicitly.
 */
const ADD_COLUMNS: Array<[string, string]> = [
  ['scholarships', 'degree_level TEXT'],
  ['scholarships', 'field_of_study TEXT'],
  ['scholarships', "documents TEXT[] NOT NULL DEFAULT '{}'"],
  ['scholarships', 'application_process TEXT'],
  ['scholarships', 'deadline_note TEXT'],
  ['scholarships', 'image_url TEXT'],
  ['scholarships', "opportunity_type TEXT NOT NULL DEFAULT 'scholarship'"],
  ['scholarships', 'last_verified TIMESTAMPTZ'],
  ['careers', 'responsibilities TEXT'],
  ['careers', 'education_required TEXT'],
  ['careers', 'personality_fit TEXT'],
  ['majors', "subjects TEXT[] NOT NULL DEFAULT '{}'"],
  ['majors', 'personality_fit TEXT'],
  ['majors', 'job_market_demand TEXT'],
  ['majors', "universities TEXT[] NOT NULL DEFAULT '{}'"],
  ['majors', "related_scholarships TEXT[] NOT NULL DEFAULT '{}'"],
  // Universities are seeded from the frontend dataset, which carries these.
  // `slug` lets the frontend keep its existing /universities/cadt URLs.
  ['universities', 'slug TEXT'],
  ['universities', 'short_name TEXT'],
  ['universities', 'type TEXT'],
  ['universities', 'phone TEXT'],
  ['universities', 'established TEXT'],
  ['universities', 'student_count TEXT'],
  ['universities', 'image_url TEXT'],
  ['universities', "scholarships TEXT[] NOT NULL DEFAULT '{}'"]
];

/**
 * Constraints that CREATE TABLE adds but an older database will not have.
 *
 * The natural-key indexes are what make re-seeding non-destructive: the seeder
 * matches a spreadsheet row to the record it already created and updates it in
 * place, so ids stay stable and saved items keep pointing at the right thing.
 */
const ADD_CONSTRAINTS: string[] = [
  `CREATE UNIQUE INDEX IF NOT EXISTS universities_slug_key ON universities (slug)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS scholarships_title_key ON scholarships (title)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS careers_title_key ON careers (title)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS majors_name_key ON majors (name)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS universities_name_key ON universities (name)`
];

/** Columns the source spreadsheets do not supply: relaxed rather than faked. */
const DROP_NOT_NULL: Array<[string, string]> = [
  ['careers', 'average_salary'],
  ['careers', 'growth_outlook'],
  ['careers', 'source'],
  ['careers', 'source_url'],
  ['majors', 'duration'],
  ['majors', 'degree_type'],
  ['majors', 'source'],
  ['majors', 'source_url'],
  // The university dataset has no ranking or acceptance rate.
  ['universities', 'tuition_range'],
  ['universities', 'acceptance_rate']
];

/** Order matters: children are truncated before the rows they reference. */
export const TABLE_NAMES = [
  'saved_items',
  'reports',
  'verification_requests',
  'scholarships',
  'universities',
  'majors',
  'careers',
  'users'
] as const;

/** Tables the spreadsheets own. Everything else is user-generated. */
export const CONTENT_TABLES = ['scholarships', 'universities', 'majors', 'careers'] as const;

/** The column that identifies a spreadsheet row across re-seeds. */
export const NATURAL_KEY: Record<(typeof CONTENT_TABLES)[number], string> = {
  scholarships: 'title',
  universities: 'name',
  majors: 'name',
  careers: 'title'
};

export const createTables = async (pool: Pool): Promise<void> => {
  for (const statement of TABLES) await pool.query(statement);
};

export const applyMigrations = async (pool: Pool): Promise<void> => {
  for (const [table, definition] of ADD_COLUMNS) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${definition}`);
  }
  for (const [table, column] of DROP_NOT_NULL) {
    await pool.query(`ALTER TABLE ${table} ALTER COLUMN ${column} DROP NOT NULL`);
  }
  for (const statement of ADD_CONSTRAINTS) {
    await pool.query(statement);
  }
  await retireSavedOpportunities(pool);
};

/**
 * `saved_opportunities` was the scholarship-only save list behind the old
 * `POST /scholarships/:id/save`. `saved_items` replaced it, so any rows an
 * older database still holds are carried across before the table is dropped —
 * in one transaction, so a failure leaves both tables as they were.
 */
const retireSavedOpportunities = async (pool: Pool): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT to_regclass('saved_opportunities') IS NOT NULL AS present`
  );
  if (!rows[0].present) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO saved_items (user_id, item_type, item_id, saved_at)
       SELECT user_id, 'scholarship', scholarship_id, saved_at FROM saved_opportunities
       ON CONFLICT DO NOTHING`
    );
    await client.query('DROP TABLE saved_opportunities');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/** Delete every row, leaving the schema in place. */
export const clearAllTables = async (pool: Pool): Promise<void> => {
  await pool.query(`TRUNCATE ${TABLE_NAMES.join(', ')} RESTART IDENTITY CASCADE`);
};
