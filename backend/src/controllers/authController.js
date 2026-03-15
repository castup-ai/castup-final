import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

// Email transporter (Gmail SMTP)
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER || 'castupaiapp@gmail.com',
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"CastUp" <${process.env.SMTP_USER || 'castupaiapp@gmail.com'}>`,
            to, subject, html
        });
        console.log(`✅ Email sent to ${to}`);
        return true;
    } catch (err) {
        console.error('❌ Email send failed:', err.message);
        return false;
    }
};

// Signup
export const signup = async (req, res) => {
    try {
        const { email, password, name, department, country, phone } = req.body;

        // Check if user exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, department, country, phone) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, name, email, department, country, phone, 
                       role, category, experience, availability, location, 
                       languages, age, gender, height, weight, next_available as "nextAvailable", 
                       bio, years_of_experience as "yearsOfExperience", awards, skills, 
                       portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                       profile_picture as "photo", created_at as "createdAt"`,
            [email, passwordHash, name, department, country, phone]
        );

        const user = result.rows[0];

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: user,
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup', details: error.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await pool.query(
            `SELECT id, name, email, department, country, phone, 
                    role, category, experience, availability, location, 
                    languages, age, gender, height, weight, next_available as "nextAvailable", 
                    bio, years_of_experience as "yearsOfExperience", awards, skills, 
                    portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                    profile_picture as "photo", password_hash
             FROM users 
             WHERE email = $1`, 
            [email]
        );
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
                ...user,
                password_hash: undefined // Don't send the hash
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
            'SELECT id, email, name, department, profile_picture as photo, created_at FROM users WHERE id = $1',
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

        // Generate reset link
        const resetUrl = `${process.env.CLIENT_URL || 'https://castup-frontend.vercel.app'}/reset-password/${token}`;
        console.log('Reset URL generated:', resetUrl);

        // Send password reset email
        // We MUST await this. On cloud hosts like Render/Vercel, un-awaited promises 
        // after the response is sent are often killed, resulting in silent email failures.
        const sent = await sendEmail({
            to: user.email,
            subject: 'CastUp - Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #13111c; color: #e2e8f0; border-radius: 12px;">
                    <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 8px;">CastUp</h1>
                    <h2 style="font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>
                    <p style="color: #94a3b8;">Hi <strong style="color: #e2e8f0;">${user.name}</strong>,</p>
                    <p style="color: #94a3b8;">We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 32px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset My Password</a>
                    <p style="color: #64748b; font-size: 14px;">This link will expire in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
                    <hr style="border-color: #334155; margin: 24px 0;" />
                    <p style="color: #475569; font-size: 12px;">© 2025 CastUp. Your cinema industry companion.</p>
                </div>
            `
        });

        if (sent) console.log(`✅ Reset email successfully sent to ${user.email}`);
        else console.error(`❌ Failed to send reset email to ${user.email}`);

        console.log(`ℹ️ Responding to client for forgot-password request (${user.email})`);

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
