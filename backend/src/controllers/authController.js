import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import axios from 'axios';
import admin from 'firebase-admin';

// Initialize Firebase Admin (Secure way to verify OTP on backend)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (err) {
        console.error('❌ Failed to initialize Firebase Admin:', err.message);
    }
} else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found. Phone OTP verification will be disabled.');
}



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
            `SELECT id, name, email, department, country, phone, 
                    role, category, experience, availability, location, 
                    languages, age, gender, height, weight, next_available as "nextAvailable", 
                    bio, years_of_experience as "yearsOfExperience", awards, skills, 
                    portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                    profile_picture as "photo", created_at as "createdAt"
             FROM users 
             WHERE id = $1`,
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
    const { email } = req.body;
    console.log(`🔑 Forgot password requested for: ${email}`);

    const handleRequest = async () => {
        try {
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // 1. Find user
            console.log('  - Finding user...');
            const userResult = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);

            if (userResult.rows.length === 0) {
                console.warn(`  - Email not found: ${email}`);
                return res.status(404).json({ error: 'This email is not registered with us.' });
            }

            const user = userResult.rows[0];

            // 2. Generate and store token
            console.log('  - Generating reset token...');
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await pool.query(
                `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
                [user.id, token, expiresAt]
            );

            // 3. Send email
            const resetUrl = `${process.env.CLIENT_URL || 'https://castup-final.vercel.app'}/reset-password/${token}`;
            console.log('Reset URL generated:', resetUrl);

            const mailResult = await sendEmail({
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
            
            if (mailResult.success) {
                return res.json({ success: true, message: 'Reset link sent.' });
            } else {
                console.error(`🆘 EMERGENCY FALLBACK: Email failed for ${user.email}. Reset URL: ${resetUrl}`);
                return res.status(500).json({ error: `Email Error: ${mailResult.error || 'Unknown SMTP error'}. Check backend logs for the manual reset link.` });
            }
        } catch (error) {
            console.error('Forgot password inner error:', error);
            return res.status(500).json({ error: 'Server error processing request' });
        }
    };

    // Overall 100s timeout to allow for two 45s SMTP attempts + cold start
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 100000)
    );

    try {
        await Promise.race([handleRequest(), timeoutPromise]);
    } catch (err) {
        if (!res.headersSent) {
            console.error(`❌ Forgot Password timed out for ${email}`);
            res.status(504).json({ error: 'The request timed out. Please try again.' });
        }
    }
};

// Reset Password - Update password with either Email Token or Phone OTP Token
export const resetPassword = async (req, res) => {
    try {
        const { token, idToken, phoneNumber, password, newPassword } = req.body;
        const finalPassword = password || newPassword;

        if (!finalPassword) return res.status(400).json({ error: 'Password is required' });
        if (!token && !idToken) return res.status(400).json({ error: 'Authentication token required' });

        let userId = null;

        // CASE 1: Reset using Phone OTP (idToken)
        if (idToken) {
            console.log(`🔐 Phone Reset requested for: ${phoneNumber}`);
            if (!admin.apps.length) {
                return res.status(500).json({ error: 'Firebase Admin not configured on server. Contact admin.' });
            }

            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                const phoneFromToken = decodedToken.phone_number;

                // Security check: Match phone number
                if (phoneNumber && phoneFromToken !== phoneNumber) {
                    return res.status(401).json({ error: 'Phone number mismatch' });
                }

                // Find user by phone
                const userResult = await pool.query('SELECT id FROM users WHERE phone = $1', [phoneFromToken]);
                if (userResult.rows.length === 0) {
                    return res.status(404).json({ error: 'No user found with this phone number' });
                }
                userId = userResult.rows[0].id;
            } catch (err) {
                console.error('🔥 Firebase Token Error:', err.message);
                return res.status(401).json({ error: 'Invalid or expired OTP token' });
            }
        } 
        
        // CASE 2: Reset using Email Link (token)
        else if (token) {
            console.log(`📧 Email Reset requested with token: ${token.substring(0, 8)}...`);
            const tokenResult = await pool.query(
                `SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1`,
                [token]
            );

            if (tokenResult.rows.length === 0) return res.status(400).json({ error: 'Invalid reset link' });
            
            const resetData = tokenResult.rows[0];
            if (new Date() > new Date(resetData.expires_at)) return res.status(400).json({ error: 'Reset link expired' });
            if (resetData.used) return res.status(400).json({ error: 'Link already used' });

            userId = resetData.user_id;

            // Mark email token as used
            await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);
        }

        // 3. Perform Password Update
        const passwordHash = await bcrypt.hash(finalPassword, 10);
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [passwordHash, userId]
        );

        console.log(`✅ Password updated for user: ${userId}`);
        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Reset password global error:', error);
        res.status(500).json({ error: 'Server error processing password update' });
    }
};

// Check if phone number exists in DB
export const checkPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

        // Normalize phone number (handle cases with/without + and spaces)
        let formattedPhone = phoneNumber.replace(/\s+/g, '');
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }

        console.log(`🔍 Checking if phone exists: ${formattedPhone}`);

        const result = await pool.query('SELECT name FROM users WHERE phone = $1', [formattedPhone]);
        
        if (result.rows.length === 0) {
            console.warn(`❌ Phone not found in DB: ${formattedPhone}`);
            return res.status(404).json({ error: 'User not found. Please check the number or register.' });
        }

        console.log(`✅ Phone found: ${result.rows[0].name}`);
        res.json({ success: true, name: result.rows[0].name });

    } catch (error) {
        console.error('Check phone error:', error);
        res.status(500).json({ error: 'Server error checking phone number' });
    }
};
