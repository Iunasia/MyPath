/**
 * Test harness.
 *
 * Import `api` from here — never `../app` directly. This module rewrites
 * DATABASE_URL to the throwaway test database *before* loading the app, and
 * the app opens its connection pool at import time. Importing the app any
 * other way would point the tests at the development database and wipe it.
 */
import type { Express } from 'express';
import type { Pool } from 'pg';
import request from 'supertest';

process.env.NODE_ENV = 'test';

/** postgres://user:pass@host:5432/mypath -> .../mypath_test */
export const toTestDatabaseUrl = (url: string): string => {
  const parsed = new URL(url);
  const name = parsed.pathname.replace(/^\//, '') || 'mypath';
  parsed.pathname = `/${name.endsWith('_test') ? name : `${name}_test`}`;
  return parsed.toString();
};

const source = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!source) {
  throw new Error('DATABASE_URL (or TEST_DATABASE_URL) must be set to run the API tests.');
}

const testUrl = toTestDatabaseUrl(source);
if (!/_test(\?|$)/.test(new URL(testUrl).pathname + new URL(testUrl).search)) {
  throw new Error(`Refusing to run tests against a non-test database: ${testUrl}`);
}
process.env.DATABASE_URL = testUrl;

// Loaded with require, after the env rewrite above, so the pool is built
// against the test database no matter how the bundler orders ES imports.
const app: Express = require('../app').default;
const pool: Pool = require('../config/db').default;
const { createTables, applyMigrations, clearAllTables } = require('../seeds/schema');

export { app, pool };

/** A fresh, cookie-less client. */
export const api = () => request(app);

/**
 * A client that keeps its session cookie across calls, so a logged-in journey
 * can be expressed as a sequence of requests.
 */
export const agent = () => request.agent(app);

let schemaReady = false;

/** Create the schema once per run, then empty every table. */
export const resetDb = async (): Promise<void> => {
  if (!schemaReady) {
    await createTables(pool);
    await applyMigrations(pool);
    schemaReady = true;
  }
  await clearAllTables(pool);
};

export const closeDb = async (): Promise<void> => {
  await pool.end();
};

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

let scholarshipSeq = 0;
let careerSeq = 0;
let majorSeq = 0;
let universitySeq = 0;

export interface ScholarshipOverrides {
  [key: string]: unknown;
}

/** Minimal valid scholarship; override any field per test. */
export const insertScholarship = async (overrides: ScholarshipOverrides = {}): Promise<number> => {
  const row = {
    // Title is the natural key the seeder upserts on, and is now uniquely
    // indexed — so fixtures generate a distinct one unless a test overrides it.
    title: `Test Scholarship ${++scholarshipSeq}`,
    provider: 'Test University',
    provider_type: 'university',
    description: 'A scholarship used by the test suite.',
    amount: '100% tuition',
    coverage: 'Full tuition',
    eligibility: 'Test eligibility',
    degree_level: 'Bachelor',
    field_of_study: 'Computer Science',
    documents: ['ID'],
    application_process: 'Apply online',
    deadline: new Date('2026-09-18T10:00:00Z'),
    deadline_note: null,
    application_link: 'https://example.edu.kh/apply',
    image_url: null,
    country: 'Cambodia',
    opportunity_type: 'scholarship',
    source: 'example.edu.kh',
    source_url: 'https://example.edu.kh/apply',
    source_type: 'official',
    verified_status: 'verified',
    last_verified: null,
    safety_warnings: [] as string[],
    ...overrides
  };

  const columns = Object.keys(row);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const res = await pool.query(
    `INSERT INTO scholarships (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    Object.values(row)
  );
  return res.rows[0].id as number;
};

export const insertCareer = async (overrides: ScholarshipOverrides = {}): Promise<number> => {
  const row = {
    title: `Software Developer ${++careerSeq}`,
    category: 'Technology',
    description: 'Builds software.',
    responsibilities: 'Writes code.',
    average_salary: null,
    growth_outlook: 'High',
    education_required: "Bachelor's in CS",
    personality_fit: 'Logical',
    required_skills: ['Programming'],
    related_majors: ['Computer Science'],
    source: null,
    source_url: null,
    ...overrides
  };
  const columns = Object.keys(row);
  const res = await pool.query(
    `INSERT INTO careers (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    Object.values(row)
  );
  return res.rows[0].id as number;
};

export const insertMajor = async (overrides: ScholarshipOverrides = {}): Promise<number> => {
  const row = {
    name: `Computer Science ${++majorSeq}`,
    field: 'Technology',
    description: 'Study of computation.',
    duration: null,
    degree_type: null,
    subjects: ['Programming'],
    personality_fit: 'Logical',
    job_market_demand: 'High',
    related_careers: ['Software Developer'],
    universities: ['CADT'],
    related_scholarships: ['Techo'],
    source: null,
    source_url: null,
    ...overrides
  };
  const columns = Object.keys(row);
  const res = await pool.query(
    `INSERT INTO majors (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    Object.values(row)
  );
  return res.rows[0].id as number;
};

export const insertUniversity = async (overrides: ScholarshipOverrides = {}): Promise<number> => {
  const row = {
    slug: null,
    name: `Test University ${++universitySeq}`,
    country: 'Cambodia',
    city: 'Phnom Penh',
    ranking: 1,
    description: 'A university.',
    website: 'https://example.edu.kh',
    tuition_range: '$1,000/year',
    acceptance_rate: '50%',
    programs: ['Computer Science'],
    source: 'example.edu.kh',
    source_url: 'https://example.edu.kh',
    ...overrides
  };
  const columns = Object.keys(row);
  const res = await pool.query(
    `INSERT INTO universities (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
    Object.values(row)
  );
  return res.rows[0].id as number;
};

/** Registers a user and returns an agent already carrying their session. */
export const registerAndLogin = async (
  overrides: { name?: string; email?: string; password?: string } = {}
) => {
  const user = {
    name: overrides.name ?? 'Test Student',
    email: overrides.email ?? `student_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: overrides.password ?? 'password123'
  };
  const client = agent();
  const res = await client.post('/auth/register').send(user);
  if (res.status !== 201) {
    throw new Error(`Fixture registration failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return { client, user, id: res.body.user.id as number };
};
