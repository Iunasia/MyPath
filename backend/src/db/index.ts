/**
 * The Drizzle handle.
 *
 * Deliberately built on the SAME `pg.Pool` the raw-SQL code already uses, not a
 * second connection. That is what makes this migration incremental: a model
 * converted to Drizzle and a model still running `pool.query` share one pool,
 * one connection budget and one transaction when they need to. Files can move
 * over one at a time instead of in a single risky rewrite.
 *
 * It also means the test harness keeps working untouched — it rewrites
 * DATABASE_URL before importing the app, the pool is built against the test
 * database, and Drizzle inherits that automatically.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pool from '../config/db';
import * as schema from './schema';

export const db = drizzle(pool, { schema });

export { schema };
export default db;
