import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        const userRes = await pool.query("SELECT * FROM users WHERE name ILIKE '%sabareesh%' LIMIT 1");
        if (userRes.rows.length === 0) {
            console.log("User sabareesh not found");
            process.exit(0);
        }
        const user = userRes.rows[0];
        console.log("Found user:", user.email, "ID:", user.id);

        const connRes = await pool.query(
            `SELECT COUNT(*) as count FROM connections
             WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'connected'`,
            [user.id]
        );
        const filesCount = await pool.query('SELECT COUNT(*) as count FROM files WHERE user_id = $1', [user.id]);
        
        console.log("Connections DB:", connRes.rows[0].count);
        console.log("Files DB:", filesCount.rows[0].count);
        console.log("Profile views DB:", user.profile_views);
    } catch(e) {
        console.error("DB Error:", e);
    } finally {
        pool.end();
    }
}

run();
