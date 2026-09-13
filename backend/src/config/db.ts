import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * On Vercel every concurrent request can run in its own function instance,
 * and each instance opens its own pool. A default-sized pool (10) therefore
 * multiplies by the number of live instances and exhausts the database's
 * connection limit under very little traffic, so cap it at one there and let a
 * long-running server keep the normal pool.
 *
 * Point DATABASE_URL at the provider's *pooled* connection string (Neon's
 * `-pooler` host, Supabase's port 6543) so short-lived functions reuse
 * connections instead of opening a fresh one per invocation.
 */
const isServerless = Boolean(process.env.VERCEL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: isServerless ? 1 : 10,
  // A cold function should fail fast rather than hang until the gateway
  // timeout when the database is unreachable.
  connectionTimeoutMillis: isServerless ? 10_000 : 0,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err.message);
});

export default pool;