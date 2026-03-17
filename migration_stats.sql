-- Migration: Add profile_views to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Optional: Index for recent joining query performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
