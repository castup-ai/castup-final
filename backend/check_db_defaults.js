import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDefaults() {
    let out = '';
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name IN ('casting_calls', 'password_reset_tokens')
        `);
        res.rows.forEach(r => {
            out += `${r.table_name}.${r.column_name}: default = ${r.column_default}\n`;
        });
    } catch (e) {
        out += 'Error: ' + e + '\n';
    } finally {
        await pool.end();
        fs.writeFileSync('db_defaults.txt', out, 'utf8');
    }
}

checkDefaults();
