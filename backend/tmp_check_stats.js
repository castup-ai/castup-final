import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.ryfshmowvjyluazozexf:t5982Sg0q81iJ26h@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
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
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
