import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use SSL only if explicitly enabled or required by remote connection string
const useSsl =
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_URL?.includes('sslmode=require') ?? false);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
});

export default pool;