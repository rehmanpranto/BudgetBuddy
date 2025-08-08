import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL not set. Please add it to .env');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase.com') 
    ? { rejectUnauthorized: false, sslmode: 'require' }
    : false,
});

export const query = (text, params) => pool.query(text, params);
