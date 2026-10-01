import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === 'true',
};

export function requireDatabaseUrl() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not set. Use .env locally or environment variables on the server.');
  }

  return config.databaseUrl;
}
