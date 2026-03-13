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
                country VARCHAR(100),
                phone VARCHAR(50),
                
                -- Extended Profile Fields from MyProfile.jsx
                role VARCHAR(100),
                category VARCHAR(50),
                experience VARCHAR(50),
                availability VARCHAR(50),
                location VARCHAR(255),
                languages TEXT[],
                age INTEGER,
                gender VARCHAR(50),
                height VARCHAR(50),
                weight VARCHAR(50),
                next_available DATE,
                bio TEXT,
                years_of_experience INTEGER DEFAULT 0,
                awards TEXT,
                skills TEXT[],
                portfolio_link TEXT,
                social_media JSONB DEFAULT '{}',
                project_type VARCHAR(100),
                
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
                project_type VARCHAR(100),
                category VARCHAR(50),
                sub_category VARCHAR(100),
                experience VARCHAR(100),
                country VARCHAR(100),
                state VARCHAR(100),
                city VARCHAR(100),
                last_date_to_apply DATE,
                service_duration JSONB DEFAULT '{}',
                requirements TEXT,
                documents JSONB DEFAULT '[]',
                status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
                applications JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Ensure existing casting_calls have all columns
        const castingCols = await pool.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'casting_calls'
        `);
        const existingCastingCols = castingCols.rows.map(r => r.column_name);
        
        const newCastingCols = [
            ['project_type', 'VARCHAR(100)'],
            ['category', 'VARCHAR(50)'],
            ['sub_category', 'VARCHAR(100)'],
            ['experience', 'VARCHAR(100)'],
            ['country', 'VARCHAR(100)'],
            ['state', 'VARCHAR(100)'],
            ['city', 'VARCHAR(100)'],
            ['last_date_to_apply', 'DATE'],
            ['service_duration', 'JSONB DEFAULT \'{}\''],
            ['documents', 'JSONB DEFAULT \'[]\'']
        ];

        for (const [col, type] of newCastingCols) {
            if (!existingCastingCols.includes(col)) {
                await pool.query(`ALTER TABLE casting_calls ADD COLUMN ${col} ${type}`);
            }
        }

        // Notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(100) NOT NULL,
                title VARCHAR(255),
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Ensure notifications table has title column
        const notifCols = await pool.query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'
        `);
        const existingNotifCols = notifCols.rows.map(r => r.column_name);
        if (!existingNotifCols.includes('title')) {
            await pool.query('ALTER TABLE notifications ADD COLUMN title VARCHAR(255)');
        }

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
