import pool from '../config/database.js';

// Create casting call
export const createCastingCall = async (req, res) => {
    try {
        const { title, description, requirements } = req.body;

        const result = await pool.query(
            `INSERT INTO casting_calls (created_by, title, description, requirements) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [req.userId, title, description, JSON.stringify(requirements)]
        );

        res.status(201).json({
            success: true,
            message: 'Casting call created',
            castingCall: result.rows[0]
        });
    } catch (error) {
        console.error('Create casting call error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all casting calls
export const getCastingCalls = async (req, res) => {
    try {
        const { status = 'open' } = req.query;

        const result = await pool.query(
            `SELECT c.*, u.name as creator_name, u.department as creator_department
             FROM casting_calls c
             JOIN users u ON c.created_by = u.id
             WHERE c.status = $1
             ORDER BY c.created_at DESC`,
            [status]
        );

        res.json({ success: true, castingCalls: result.rows });
    } catch (error) {
        console.error('Get casting calls error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get casting call by ID
export const getCastingCallById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT c.*, u.name as creator_name, u.email as creator_email, u.department as creator_department
             FROM casting_calls c
             JOIN users u ON c.created_by = u.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Casting call not found' });
        }

        res.json({ success: true, castingCall: result.rows[0] });
    } catch (error) {
        console.error('Get casting call error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Apply to casting call
export const applyToCastingCall = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // Get casting call
        const castingCall = await pool.query('SELECT * FROM casting_calls WHERE id = $1', [id]);
        if (castingCall.rows.length === 0) {
            return res.status(404).json({ error: 'Casting call not found' });
        }

        // Add application
        const applications = castingCall.rows[0].applications || [];
        applications.push({
            userId: req.userId,
            message,
            appliedAt: new Date().toISOString()
        });

        await pool.query(
            'UPDATE casting_calls SET applications = $1 WHERE id = $2',
            [JSON.stringify(applications), id]
        );

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Apply to casting call error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
