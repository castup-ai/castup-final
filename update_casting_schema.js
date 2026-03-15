import pool from './backend/src/config/database.js';

async function updateSchema() {
    try {
        console.log("Checking and updating schema...");
        
        // Add pay_rate if not exists
        await pool.query("ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS pay_rate VARCHAR(255)");
        // Add start_date if not exists
        await pool.query("ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS start_date DATE");
        // Add end_date if not exists
        await pool.query("ALTER TABLE casting_calls ADD COLUMN IF NOT EXISTS end_date DATE");
        
        console.log("Schema updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Schema update failed:", err);
        process.exit(1);
    }
}

updateSchema();
