import pool from '../config/database.js';

// Initialize database tables
export const initializeDatabase = async () => {
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                auth_provider VARCHAR(50) DEFAULT 'local',
                profile_picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Portfolios table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS portfolios (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                bio TEXT,
                experience JSONB DEFAULT '[]',
                skills TEXT[] DEFAULT '{}',
                media JSONB DEFAULT '{}',
                external_links JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Files table (Script Locker)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS files (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                source_type VARCHAR(50) CHECK (source_type IN ('computer', 'youtube', 'instagram')),
                file_url TEXT,
                source_url TEXT,
                shared_with UUID[] DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Casting calls table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS casting_calls (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                created_by UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                requirements JSONB DEFAULT '{}',
                status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
                applications JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Password reset tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
};

export default initializeDatabase;
