import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

// Signup
export const signup = async (req, res) => {
    try {
        const { email, password, name, department } = req.body;

        // Check if user exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, department) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, name, department, created_at`,
            [email, passwordHash, name, department]
        );

        const user = result.rows[0];

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                department: user.department
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup' });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                department: user.department
            },
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Get current user
export const getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, department, profile_picture, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Forgot Password - Request reset token
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user
        const userResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);

        // Always return success to prevent email enumeration
        if (userResult.rows.length === 0) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        const user = userResult.rows[0];

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store token in database
        await pool.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
             VALUES ($1, $2, $3)`,
            [user.id, token, expiresAt]
        );

        // TODO: Send email with reset link
        // For now, log to console (replace with email service in production)
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
        console.log('\n========================================');
        console.log('PASSWORD RESET REQUEST');
        console.log('========================================');
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Reset Link: ${resetUrl}`);
        console.log(`Expires: ${expiresAt.toLocaleString()}`);
        console.log('========================================\n');

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error processing request' });
    }
};

// Reset Password - Update password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Find valid token
        const tokenResult = await pool.query(
            `SELECT user_id, expires_at, used 
             FROM password_reset_tokens 
             WHERE token = $1`,
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const resetToken = tokenResult.rows[0];

        // Check if token is expired
        if (new Date() > new Date(resetToken.expires_at)) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Check if token was already used
        if (resetToken.used) {
            return res.status(400).json({ error: 'This reset link has already been used' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user password
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordHash, resetToken.user_id]
        );

        // Mark token as used
        await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
            [token]
        );

        console.log(`✅ Password reset successful for user ID: ${resetToken.user_id}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error processing request' });
    }
};
