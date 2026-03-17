// One-time migration: Add missing columns to casting_calls
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const run = async () => {
    try {
        const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'casting_calls'`);
        const existing = cols.rows.map(r => r.column_name);
        console.log('Existing columns:', existing);

        const toAdd = [
            ['pay_rate', 'VARCHAR(255)'],
            ['start_date', 'DATE'],
            ['end_date', 'DATE'],
        ];

        for (const [col, type] of toAdd) {
            if (!existing.includes(col)) {
                await pool.query(`ALTER TABLE casting_calls ADD COLUMN ${col} ${type}`);
                console.log(`✅ Added column: ${col}`);
            } else {
                console.log(`⏭  Column already exists: ${col}`);
            }
        }

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await pool.end();
    }
};

run();
