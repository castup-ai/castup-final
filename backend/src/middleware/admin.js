import pool from '../config/database.js';

const ADMIN_EMAILS = ['castup4862446@gmail.com', 'castupaiapp@gmail.com'];

const adminMiddleware = async (req, res, next) => {
    if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
        const user = result.rows[0];

        if (!user || !ADMIN_EMAILS.includes(user.email)) {
             return res.status(403).json({ error: 'Forbidden: Admin access only' });
         }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default adminMiddleware;
