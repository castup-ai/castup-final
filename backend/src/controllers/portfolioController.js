import crypto from 'crypto';
import pool from '../config/database.js';

// Create/Update portfolio
export const createOrUpdatePortfolio = async (req, res) => {
    try {
        const { bio, experience, skills, media, externalLinks } = req.body;

        // Check if portfolio exists
        const existing = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1',
            [req.userId]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing portfolio
            result = await pool.query(
                `UPDATE portfolios 
                 SET bio = $1, experience = $2, skills = $3, media = $4, external_links = $5, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $6
                 RETURNING *`,
                [bio, JSON.stringify(experience), skills, JSON.stringify(media), JSON.stringify(externalLinks), req.userId]
            );
        } else {
            // Create new portfolio
            result = await pool.query(
                `INSERT INTO portfolios (user_id, bio, experience, skills, media, external_links) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [req.userId, bio, JSON.stringify(experience), skills, JSON.stringify(media), JSON.stringify(externalLinks)]
            );
        }

        res.json({
            success: true,
            message: existing.rows.length > 0 ? 'Portfolio updated' : 'Portfolio created',
            portfolio: result.rows[0]
        });
    } catch (error) {
        console.error('Create/Update portfolio error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get portfolio by user ID
export const getPortfolio = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT p.*, u.name, u.email, u.department, u.profile_picture 
             FROM portfolios p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }

        res.json({ success: true, portfolio: result.rows[0] });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get my portfolio
export const getMyPortfolio = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM portfolios WHERE user_id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, portfolio: null });
        }

        res.json({ success: true, portfolio: result.rows[0] });
    } catch (error) {
        console.error('Get my portfolio error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Add project/media to portfolio (From UploadWork.jsx)
export const addPortfolioMedia = async (req, res) => {
    try {
        const { title, type, description, castCrew, files } = req.body;

        // Ensure portfolio exists first
        let existing = await pool.query(
            'SELECT id, media FROM portfolios WHERE user_id = $1',
            [req.userId]
        );

        let currentMedia = [];
        if (existing.rows.length === 0) {
            // Create empty portfolio
            const insertResult = await pool.query(
                `INSERT INTO portfolios (user_id, bio, experience, skills, media, external_links) 
                 VALUES ($1, '', '[]', '{}', '[]', '{}') 
                 RETURNING id, media`,
                [req.userId]
            );
            currentMedia = insertResult.rows[0].media || [];
        } else {
            currentMedia = existing.rows[0].media || [];
            // Handle cases where media might not be an array
            if (!Array.isArray(currentMedia)) {
                try {
                    currentMedia = typeof currentMedia === 'string' ? JSON.parse(currentMedia) : [];
                    if (!Array.isArray(currentMedia)) currentMedia = [];
                } catch(e) {
                    currentMedia = [];
                }
            }
        }

        const newProject = {
            id: crypto.randomUUID(),
            title,
            type,
            description,
            castCrew,
            files: files || [],
            createdAt: new Date().toISOString()
        };

        currentMedia.unshift(newProject); // put newest at top

        const result = await pool.query(
            `UPDATE portfolios 
             SET media = $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2
             RETURNING *`,
            [JSON.stringify(currentMedia), req.userId]
        );

        res.json({
            success: true,
            message: 'Project uploaded successfully',
            portfolio: result.rows[0]
        });
    } catch (error) {
        console.error('Add portfolio media error:', error);
        res.status(500).json({ error: 'Server error saving work' });
    }
};
