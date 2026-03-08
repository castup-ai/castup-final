import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import pool from './database.js';

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                const existingUser = await pool.query(
                    'SELECT * FROM users WHERE email = $1',
                    [profile.emails[0].value]
                );

                if (existingUser.rows.length > 0) {
                    return done(null, existingUser.rows[0]);
                }

                // Create new user
                const newUser = await pool.query(
                    `INSERT INTO users (email, name, auth_provider, profile_picture) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                    [
                        profile.emails[0].value,
                        profile.displayName,
                        'google',
                        profile.photos[0]?.value
                    ]
                );

                done(null, newUser.rows[0]);
            } catch (error) {
                done(error, null);
            }
        }));
}

// Configure Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'photos']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No email from Facebook'), null);
                }

                // Check if user exists
                const existingUser = await pool.query(
                    'SELECT * FROM users WHERE email = $1',
                    [email]
                );

                if (existingUser.rows.length > 0) {
                    return done(null, existingUser.rows[0]);
                }

                // Create new user
                const newUser = await pool.query(
                    `INSERT INTO users (email, name, auth_provider, profile_picture) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`,
                    [
                        email,
                        `${profile.name.givenName} ${profile.name.familyName}`,
                        'facebook',
                        profile.photos?.[0]?.value
                    ]
                );

                done(null, newUser.rows[0]);
            } catch (error) {
                done(error, null);
            }
        }));
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
