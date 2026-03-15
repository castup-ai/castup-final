const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.epnyirkhcbtvcdvnqcfh:castupaidb123@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' });

async function addMissingColumns() {
    try {
        await client.connect();
        console.log("Adding missing columns to users table...");
        
        await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS projects_worked_on TEXT");
        console.log("✅ Added projects_worked_on");
        
        await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS additional_skills TEXT");
        console.log("✅ Added additional_skills");
        
    } catch (err) {
        console.error("❌ Schema update failed:", err.message);
    } finally {
        await client.end();
    }
}

addMissingColumns();
