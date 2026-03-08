import pool from './src/config/database.js';

async function listTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('\n📊 Tables in CastUp database:');
        result.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        console.log(`\nTotal: ${result.rows.length} tables\n`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

listTables();
