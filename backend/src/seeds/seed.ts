import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/db';
import User from '../models/User';
import { DATA_DIR, importAll } from './sources';
import { applyMigrations, clearAllTables, createTables } from './schema';
import { upsertTable } from './upsert';

/** Create the account only if that email is not already registered. */
const ensureUser = async (input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<void> => {
  const existing = await User.findByEmail(input.email);
  if (existing) return;
  await User.create(input);
};

const seed = async () => {
  console.log('🌱 Creating tables and applying migrations...');
  await createTables(pool);
  await applyMigrations(pool);

  // Read the spreadsheets before changing anything, so a bad workbook fails the
  // run without leaving the database half-written.
  console.log(`🌱 Reading workbooks from ${DATA_DIR} ...`);
  const { careers, majors, scholarships, universities, sheets } = await importAll();

  for (const sheet of sheets) {
    const label = sheet.entity === 'unrecognized' ? '⚠ unrecognized' : sheet.entity;
    console.log(`   • ${sheet.file} → "${sheet.sheet}" [${label}]: ${sheet.imported} rows (${sheet.skipped} skipped)`);
  }
  console.log(`   • universities.json [university]: ${universities.length} rows`);

  const total = careers.length + majors.length + scholarships.length + universities.length;
  if (total === 0) {
    console.error(
      '❌ No rows found. Put the .xlsx source files in\n' +
        `   ${DATA_DIR}\n` +
        '   (see the README there), then re-run. Nothing was changed.'
    );
    process.exit(1);
  }

  /**
   * Content is upserted on its natural key, so re-seeding never deletes user
   * accounts, saved items or verification requests, and record ids stay stable
   * — a student's saved scholarship keeps pointing at the same scholarship.
   * `--replace` restores the old wipe-everything behaviour for a fresh start.
   */
  const replace = process.argv.includes('--replace');

  if (replace) {
    console.log('🌱 --replace: clearing EVERYTHING, including user accounts...');
    await clearAllTables(pool);
  }

  console.log('🌱 Ensuring demo accounts exist...');
  await ensureUser({
    name: 'Demo Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student'
  });

  // Registration always creates a student — by design, so nobody can grant
  // themselves admin. The seed is therefore the only place an admin is made.
  // Change this password before the app is exposed to anything but localhost.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@domner.edu.kh';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  await ensureUser({
    name: 'Domner Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });
  console.log(`   admin account: ${adminEmail}`);

  console.log('🌱 Loading content...');
  const summaries = [
    await upsertTable(pool, 'universities', universities as unknown as Record<string, unknown>[]),
    await upsertTable(pool, 'careers', careers as unknown as Record<string, unknown>[]),
    await upsertTable(pool, 'majors', majors as unknown as Record<string, unknown>[]),
    await upsertTable(pool, 'scholarships', scholarships as unknown as Record<string, unknown>[])
  ];

  for (const s of summaries) {
    console.log(
      `   ${s.table.padEnd(14)} ${s.inserted} added, ${s.updated} updated, ${s.deleted} removed`
    );
  }

  const flagged = scholarships.filter(s => s.safety_warnings.length > 0).length;
  const dated = scholarships.filter(s => s.deadline).length;
  console.log(
    `   ${dated}/${scholarships.length} scholarships have a parsed deadline; ${flagged} carry a safety warning`
  );

  const users = await pool.query('SELECT count(*) FROM users');
  const requests = await pool.query('SELECT count(*) FROM verification_requests');
  console.log(
    `   preserved: ${users.rows[0].count} user account(s), ${requests.rows[0].count} verification request(s)`
  );

  console.log('🎉 Seeding complete! Database ready.');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
