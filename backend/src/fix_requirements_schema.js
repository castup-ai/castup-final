import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: "postgresql://postgres.epnyirkhcbtvcdvnqcfh:castupaidb123@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function runFix() {
    try {
        console.log('Altering requirements column to TEXT...');
        // We cast to text first, then change type.
        await pool.query('ALTER TABLE casting_calls ALTER COLUMN requirements TYPE TEXT');
        console.log('✅ Successfully altered requirements column.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to alter column:', err);
        process.exit(1);
    }
}

runFix();
