import pool from './backend/src/config/database.js';

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'casting_calls' ORDER BY ordinal_position");
        console.log("Casting Calls Schema:");
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
