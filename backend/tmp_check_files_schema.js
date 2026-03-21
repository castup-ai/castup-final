import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres.epnyirkhcbtvcdvnqcfh:castupaidb123@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });

async function check() {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'user_id'");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
