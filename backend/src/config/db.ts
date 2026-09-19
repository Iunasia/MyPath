import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// DATE columns (OID 1082) default to being parsed into a local-timezone JS
// Date, which then shifts to a different calendar day once serialized back
// to UTC ISO (e.g. "2000-01-15" -> "2000-01-14T17:00:00.000Z" on a UTC+7
// server). A date of birth has no time-of-day or timezone component, so keep
// it as the plain "YYYY-MM-DD" string Postgres already returns.
types.setTypeParser(1082, (value: string) => value);

const useSSL =
  process.env.DATABASE_SSL === 'true' ||
  Boolean(
    process.env.DATABASE_URL &&
      (process.env.DATABASE_URL.includes('neon.tech') ||
        process.env.DATABASE_URL.includes('sslmode=require'))
  );

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
});

export default pool;
