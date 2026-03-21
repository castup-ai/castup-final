import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres.epnyirkhcbtvcdvnqcfh:castupaidb123@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });

async function check() {
    const res = await pool.query("SELECT * FROM files ORDER BY created_at DESC LIMIT 5");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
