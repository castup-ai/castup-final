-- Database setup script for CastUp AI
-- Run this in the Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
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
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    experience JSONB DEFAULT '[]',
    skills TEXT[] DEFAULT '{}',
    media JSONB DEFAULT '[]',
    external_links JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 4. Files Table
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    source_type VARCHAR(50) CHECK (source_type IN ('computer', 'youtube', 'instagram')),
    file_url TEXT,
    source_url TEXT,
    is_portfolio BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 5. Casting Calls Table
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
    requirements JSONB DEFAULT '""',
    documents JSONB DEFAULT '[]',
    pay_rate VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    applications JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE casting_calls ENABLE ROW LEVEL SECURITY;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 8. Connections Table
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id_2 UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'connected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id_1, user_id_2)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- USERS: Everyone can read names/basic info, only owners can update
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- CASTING CALLS: Everyone can read open jobs, only creators can manage theirs
CREATE POLICY "Casting calls are viewable by everyone" ON casting_calls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create casting calls" ON casting_calls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Creators can update own casting calls" ON casting_calls FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete own casting calls" ON casting_calls FOR DELETE USING (auth.uid() = created_by);

-- PORTFOLIOS: Viewable by all, manageable by owner
CREATE POLICY "Portfolios are viewable by everyone" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Users can manage own portfolio" ON portfolios FOR ALL USING (auth.uid() = user_id);

-- FILES: Viewable by all, manageable by owner
CREATE POLICY "Files are viewable by everyone" ON files FOR SELECT USING (true);
CREATE POLICY "Users can manage own files" ON files FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS: Only owners can see/manage their notifications
CREATE POLICY "Users can see own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- CONNECTIONS: Viewable by involved users
CREATE POLICY "Users can see own connections" ON connections FOR SELECT USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
CREATE POLICY "Users can manage own connections" ON connections FOR ALL USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- PASSWORD RESET TOKENS: Internal use usually, but restrict to owners if checked
CREATE POLICY "Users can see own reset tokens" ON password_reset_tokens FOR SELECT USING (auth.uid() = user_id);
