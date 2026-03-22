import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  try {
    const apps = await pool.query(`
      SELECT a.id, a.age, a.gender, a.phone, a.whatsapp, a.email, a.address, 
             to_char(a.created_at, 'YYYY-MM-DD HH24:MI:SS') as "timestamp",
             u.name as user_name
      FROM job_applications a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC 
      LIMIT 10
    `);
    console.log('--- Recent applications with profile fallbacks ---');
    console.table(apps.rows);

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
}

checkData();
