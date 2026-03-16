import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkDb() {
    try {
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', tablesRes.rows.map(r => r.table_name));

        const getColumns = async (table) => {
            const colsRes = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\nColumns for ${table}:`);
            colsRes.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
        };

        for (const row of tablesRes.rows) {
            await getColumns(row.table_name);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

checkDb();
