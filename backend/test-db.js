import pool from './src/config/database.js';
import initializeDatabase from './src/config/init-db.js';

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');

        // Test connection
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        console.log('📅 Server time:', result.rows[0].now);

        // Initialize database
        console.log('\n🔧 Initializing database schema...');
        await initializeDatabase();

        // Check tables
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\n📊 Tables created:');
        tables.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });

        console.log('\n✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testConnection();
