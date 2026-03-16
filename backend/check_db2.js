import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDb() {
    let out = '';
    try {
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        out += 'Tables: ' + tablesRes.rows.map(r => r.table_name).join(', ') + '\n';

        const getColumns = async (table) => {
            const colsRes = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            out += `\nColumns for ${table}:\n`;
            colsRes.rows.forEach(c => out += `  - ${c.column_name} (${c.data_type})\n`);
        };

        for (const row of tablesRes.rows) {
            await getColumns(row.table_name);
        }
    } catch (e) {
        out += 'Error: ' + e + '\n';
    } finally {
        await pool.end();
        fs.writeFileSync('db_schema_utf8.txt', out, 'utf8');
    }
}

checkDb();
