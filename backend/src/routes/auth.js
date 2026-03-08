import express from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../utils/jwt.js';
import { signup, login, getCurrentUser, forgotPassword, resetPassword } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Regular email/password routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: process.env.CLIENT_URL + '/login?error=google_auth_failed'
    }),
    (req, res) => {
        // Generate JWT token
        const token = generateToken(req.user.id);

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=google`);
    }
);

// Facebook OAuth routes
router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
        session: false
    })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: process.env.CLIENT_URL + '/login?error=facebook_auth_failed'
    }),
    (req, res) => {
        // Generate JWT token
        const token = generateToken(req.user.id);

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=facebook`);
    }
);

export default router;
