
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkJobs() {
    try {
        const res = await pool.query('SELECT * FROM files WHERE name ILIKE \'%Business%\' OR name ILIKE \'%Cyber%\'');
        console.log(`Found ${res.rows.length} matching files.`);
        res.rows.forEach(row => {
            console.log(`File ID: ${row.id}`);
            console.log(`Name: ${row.name}`);
            console.log(`URL: ${row.file_url}`);
            console.log(`Created: ${row.created_at}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkJobs();
