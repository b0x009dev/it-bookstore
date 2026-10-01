import pg from 'pg';
import { config, requireDatabaseUrl } from './config-db.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: requireDatabaseUrl(),
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function closePool() {
  await pool.end();
}
