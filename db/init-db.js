import { readFile } from 'node:fs/promises';
import { query, closePool } from './connect-db.js';

const sql = await readFile('db/schema.sql', 'utf8');

try {
  await query(sql);
  console.log('Database initialized');
} finally {
  await closePool();
}
