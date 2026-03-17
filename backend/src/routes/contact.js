import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Public route to submit contact messages
router.post('/', async (req, res) => {
    try {
        const { email, phone, subject, subCategory, message, attachments } = req.body;
        
        // attachments is expected to be an array of objects { name, url, type }
        const safeAttachments = Array.isArray(attachments) ? attachments : [];

        const result = await pool.query(
            `INSERT INTO contact_messages (email, phone, subject, category, message, attachments)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [email, phone, subject, subCategory, message, JSON.stringify(safeAttachments)]
        );

        res.status(201).json({
            success: true,
            message: 'Your message has been received. We will get back to you soon!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Submit contact message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
