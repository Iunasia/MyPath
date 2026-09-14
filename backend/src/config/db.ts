import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || '';
const isInternalDb =
  url.includes('@db:') ||
  url.includes('@localhost:') ||
  url.includes('@127.0.0.1:');

// Use SSL only if external and explicitly requested
const useSsl =
  !isInternalDb &&
  (process.env.DATABASE_SSL === 'true' || url.includes('sslmode=require'));

// Remove ssl query parameters if connecting to internal Docker database
const connectionString = isInternalDb
  ? url.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]ssl=[^&]+/g, '')
  : url;

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
});

export default pool;