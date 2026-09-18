/**
 * The database shape, as Drizzle tables.
 *
 * This mirrors the CREATE TABLE statements in src/seeds/schema.ts rather than
 * replacing them. During the migration from raw SQL both descriptions of the
 * schema exist, and the raw one stays authoritative: it is what actually builds
 * the database, in production and in the test harness. Changing a column means
 * changing both until the last `pool.query` is gone, at which point the raw
 * statements can be dropped in favour of drizzle-kit migrations.
 *
 * Properties are named exactly like their columns — `source_url`, not
 * `sourceUrl`. That is not Drizzle's usual convention, and it is deliberate:
 * every route, test, OpenAPI definition and frontend type in this project
 * already reads snake_case off these rows. Naming them camelCase here would
 * force a hand-written mapper per model — roughly 160 lines of boilerplate
 * across the catalogue tables whose only job is renaming fields, each one a
 * place to silently mistype a column.
 *
 * Keeping the two in step means a converted model is a drop-in replacement and
 * the migration stays invisible above the model layer. If the codebase ever
 * moves to camelCase, change it here and fix the fallout in one pass.
 */
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  customType,
  primaryKey
} from 'drizzle-orm/pg-core';

/**
 * Drizzle has no built-in BYTEA. Avatars are stored as raw bytes in
 * `users.avatar_data`, and `pg` already hands those back as a Buffer, so this
 * maps straight through with no conversion on either side.
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea'
});

/* ------------------------------------------------------------------ */
/* Users and auth                                                      */
/* ------------------------------------------------------------------ */

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  role: text('role').notNull().default('student'),
  auth_provider: text('auth_provider').notNull().default('local'),
  google_id: text('google_id').unique(),
  avatar_url: text('avatar_url'),
  avatar_data: bytea('avatar_data'),
  avatar_mime: text('avatar_mime'),
  avatar_updated_at: timestamp('avatar_updated_at', { withTimezone: true }),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  // Kept as a plain 'YYYY-MM-DD' string: src/config/db.ts overrides the DATE
  // parser for exactly this reason, so a birthday never shifts a day across
  // timezones. `mode: 'string'` is the Drizzle equivalent of that decision.
  date_of_birth: date('date_of_birth', { mode: 'string' }),
  gender: text('gender'),
  is_verified: boolean('is_verified').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const emailVerifications = pgTable('email_verifications', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const scholarships = pgTable('scholarships', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  provider: text('provider').notNull(),
  provider_type: text('provider_type').notNull(),
  description: text('description').notNull(),
  amount: text('amount').notNull(),
  coverage: text('coverage').notNull(),
  eligibility: text('eligibility').notNull(),
  degree_level: text('degree_level'),
  field_of_study: text('field_of_study'),
  documents: text('documents').array().notNull().default([]),
  application_process: text('application_process'),
  deadline: timestamp('deadline', { withTimezone: true }),
  deadline_note: text('deadline_note'),
  application_link: text('application_link').notNull(),
  image_url: text('image_url'),
  country: text('country').notNull(),
  opportunity_type: text('opportunity_type').notNull().default('scholarship'),
  source: text('source').notNull(),
  source_url: text('source_url').notNull(),
  source_type: text('source_type').notNull(),
  verified_status: text('verified_status').notNull(),
  last_verified: timestamp('last_verified', { withTimezone: true }),
  last_verified_by: integer('last_verified_by').references(() => users.id, { onDelete: 'set null' }),
  safety_warnings: text('safety_warnings').array().notNull().default([]),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  archived_by: integer('archived_by').references(() => users.id, { onDelete: 'set null' }),
  edited_at: timestamp('edited_at', { withTimezone: true }),
  edited_by: integer('edited_by').references(() => users.id, { onDelete: 'set null' })
});

export const careers = pgTable('careers', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  responsibilities: text('responsibilities'),
  average_salary: text('average_salary'),
  growth_outlook: text('growth_outlook'),
  education_required: text('education_required'),
  personality_fit: text('personality_fit'),
  required_skills: text('required_skills').array().notNull().default([]),
  related_majors: text('related_majors').array().notNull().default([]),
  source: text('source'),
  source_url: text('source_url'),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  archived_by: integer('archived_by').references(() => users.id, { onDelete: 'set null' }),
  edited_at: timestamp('edited_at', { withTimezone: true }),
  edited_by: integer('edited_by').references(() => users.id, { onDelete: 'set null' })
});

export const majors = pgTable('majors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  field: text('field').notNull(),
  description: text('description').notNull(),
  duration: text('duration'),
  degree_type: text('degree_type'),
  subjects: text('subjects').array().notNull().default([]),
  personality_fit: text('personality_fit'),
  job_market_demand: text('job_market_demand'),
  related_careers: text('related_careers').array().notNull().default([]),
  universities: text('universities').array().notNull().default([]),
  related_scholarships: text('related_scholarships').array().notNull().default([]),
  source: text('source'),
  source_url: text('source_url'),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  archived_by: integer('archived_by').references(() => users.id, { onDelete: 'set null' }),
  edited_at: timestamp('edited_at', { withTimezone: true }),
  edited_by: integer('edited_by').references(() => users.id, { onDelete: 'set null' })
});

export const universities = pgTable('universities', {
  id: serial('id').primaryKey(),
  slug: text('slug').unique(),
  name: text('name').notNull(),
  short_name: text('short_name'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  type: text('type'),
  ranking: integer('ranking'),
  description: text('description').notNull(),
  website: text('website').notNull(),
  phone: text('phone'),
  established: text('established'),
  student_count: text('student_count'),
  image_url: text('image_url'),
  tuition_range: text('tuition_range'),
  acceptance_rate: text('acceptance_rate'),
  programs: text('programs').array().notNull().default([]),
  scholarships: text('scholarships').array().notNull().default([]),
  source: text('source').notNull(),
  source_url: text('source_url').notNull(),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  archived_by: integer('archived_by').references(() => users.id, { onDelete: 'set null' }),
  edited_at: timestamp('edited_at', { withTimezone: true }),
  edited_by: integer('edited_by').references(() => users.id, { onDelete: 'set null' })
});

/* ------------------------------------------------------------------ */
/* Student activity                                                    */
/* ------------------------------------------------------------------ */

/**
 * Polymorphic by design: `itemId` points at a different table depending on
 * `itemType`, so it is deliberately NOT a foreign key. The route validates the
 * target exists before inserting.
 */
export const savedItems = pgTable(
  'saved_items',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    itemType: text('item_type').notNull(),
    itemId: integer('item_id').notNull(),
    savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow()
  },
  table => [primaryKey({ columns: [table.userId, table.itemType, table.itemId] })]
);

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scholarship_id: integer('scholarship_id')
    .notNull()
    .references(() => scholarships.id, { onDelete: 'cascade' }),
  reason: text('reason').notNull()
});

/**
 * "Is this scholarship real?" — a student asks us to check something.
 *
 * `scholarshipId` is nullable on purpose: the important case is a link seen on
 * social media that is NOT in our catalogue, carried by `submittedUrl`. Both
 * reference columns are ON DELETE SET NULL so a re-seed or a deleted account
 * never destroys the request history.
 */
export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  scholarship_id: integer('scholarship_id').references(() => scholarships.id, {
    onDelete: 'set null'
  }),
  submitted_url: text('submitted_url'),
  submitted_title: text('submitted_title').notNull(),
  note: text('note'),
  auto_check: jsonb('auto_check'),
  status: text('status').notNull().default('pending'),
  verdict: text('verdict'),
  admin_response: text('admin_response'),
  reviewed_by: integer('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewed_at: timestamp('reviewed_at', { withTimezone: true }),
  read_by_user: boolean('read_by_user').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/**
 * Screenshots attached to a verification request. Metadata only — the bytes
 * live in object storage under `storage_key` (see src/utils/storage.ts).
 */
export const verificationAttachments = pgTable('verification_attachments', {
  id: serial('id').primaryKey(),
  request_id: integer('request_id')
    .notNull()
    .references(() => verificationRequests.id, { onDelete: 'cascade' }),
  storage_key: text('storage_key').notNull().unique(),
  mime: text('mime').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  size_bytes: integer('size_bytes').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const contentAudit = pgTable('content_audit', {
  id: serial('id').primaryKey(),
  entity: text('entity').notNull(),
  row_id: integer('row_id').notNull(),
  action: text('action').notNull(),
  actor_id: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
  changes: jsonb('changes').notNull().default({}),
  reason: text('reason'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
