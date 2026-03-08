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
