import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'job_applications'
      ORDER BY ordinal_position
    `);
    console.log('--- job_applications columns ---');
    console.table(res.rows);

    const apps = await pool.query('SELECT * FROM job_applications ORDER BY created_at DESC LIMIT 3');
    console.log('--- Recent applications ---');
    console.log(JSON.stringify(apps.rows, null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
