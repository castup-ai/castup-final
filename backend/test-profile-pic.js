import pool from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testProfilePictureUpdate() {
    try {
        console.log('🔍 Testing profile picture update...\n');

        // 1. Get a test user
        const usersResult = await pool.query('SELECT * FROM users LIMIT 1');

        if (usersResult.rows.length === 0) {
            console.log('❌ No users found in database');
            await pool.end();
            return;
        }

        const testUser = usersResult.rows[0];
        console.log('📝 Test User:', {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
            currentProfilePicture: testUser.profile_picture ? 'SET' : 'NOT SET'
        });

        // 2. Test update with a dummy base64 image
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        console.log('\n🔄 Attempting to update profile picture...');
        const updateResult = await pool.query(
            `UPDATE users 
             SET profile_picture = COALESCE($1, profile_picture),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, name, profile_picture`,
            [testImageData, testUser.id]
        );

        console.log('✅ Update successful!');
        console.log('📸 Profile picture:', updateResult.rows[0].profile_picture ? 'SAVED' : 'NOT SAVED');
        console.log('📏 Data length:', updateResult.rows[0].profile_picture?.length || 0, 'bytes');

        // 3. Verify by fetching again
        const verifyResult = await pool.query(
            'SELECT id, name, profile_picture FROM users WHERE id = $1',
            [testUser.id]
        );

        console.log('\n🔍 Verification:');
        console.log('Profile picture in DB:', verifyResult.rows[0].profile_picture ? 'EXISTS' : 'DOES NOT EXIST');

        await pool.end();
        console.log('\n✅ Test complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

testProfilePictureUpdate();
