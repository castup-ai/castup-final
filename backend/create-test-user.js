import bcrypt from 'bcrypt';
import pool from './src/config/database.js';

async function createTestUser() {
    try {
        console.log('🔧 Creating test user...');

        const testUser = {
            email: 'test@castup.com',
            password: 'test123',
            name: 'Test User',
            department: 'Actor'
        };

        // Check if test user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [testUser.email]
        );

        if (existingUser.rows.length > 0) {
            console.log('✅ Test user already exists!');
            console.log('\n📧 Email:', testUser.email);
            console.log('🔑 Password:', testUser.password);
            process.exit(0);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(testUser.password, 10);

        // Create test user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, department) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, name, department, created_at`,
            [testUser.email, passwordHash, testUser.name, testUser.department]
        );

        console.log('✅ Test user created successfully!');
        console.log('\n=================================');
        console.log('📧 Email:', testUser.email);
        console.log('🔑 Password:', testUser.password);
        console.log('=================================\n');
        console.log('User details:', result.rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        process.exit(1);
    }
}

createTestUser();
