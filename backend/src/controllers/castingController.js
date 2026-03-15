import pool from '../config/database.js';

// Create casting call
export const createCastingCall = async (req, res) => {
    try {
        console.log('Incoming job creation request:', {
            userId: req.userId,
            body: req.body
        });

        const { 
            title, description, projectType, category, subCategory, 
            experience, country, state, city, lastDateToApply, 
            serviceDuration, requirements, documents,
            payRate, startDate, endDate
        } = req.body;

        // PostgreSQL fix: empty strings are not valid dates. Convert to null.
        const safeLastDate = lastDateToApply || null;
        const safeStartDate = startDate || null;
        const safeEndDate = endDate || null;

        const result = await pool.query(
            `INSERT INTO casting_calls (
                created_by, title, description, project_type, category, 
                sub_category, experience, country, state, city, 
                last_date_to_apply, service_duration, requirements, documents,
                pay_rate, start_date, end_date
            ) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
             RETURNING *`,
            [
                req.userId, title, description, projectType, category, 
                subCategory, experience || 'Any', country, state, city, 
                safeLastDate, JSON.stringify(serviceDuration || {}), 
                requirements, JSON.stringify(documents || []),
                payRate, safeStartDate, safeEndDate
            ]
        );

        console.log('✅ Job created successfully:', result.rows[0].id);

        res.status(201).json({
            success: true,
            message: 'Casting call created',
            castingCall: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Create casting call error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            detail: error.detail
        });
        res.status(500).json({ 
            error: 'Server error', 
            details: error.message,
            code: error.code 
        });
    }
};

// Get all casting calls
export const getCastingCalls = async (req, res) => {
    try {
        const { status = 'open' } = req.query;

        const result = await pool.query(
            `SELECT c.id, c.title, c.description, c.project_type as "projectType", 
                    c.category, c.sub_category as "subCategory", c.experience, 
                    c.country, c.state, c.city, c.last_date_to_apply as "lastDateToApply", 
                    c.service_duration as "serviceDuration", c.requirements, 
                    c.documents, c.status, c.created_at as "createdAt",
                    c.pay_rate as "payRate", c.start_date as "startDate", c.end_date as "endDate",
                    u.id as "creatorId", u.name as "creatorName", u.department as "creatorDepartment"
             FROM casting_calls c
             JOIN users u ON c.created_by = u.id
             WHERE c.status = $1
             ORDER BY c.created_at DESC`,
            [status]
        );

        // Map creator fields into a nested object to match frontend expectations
        const formatted = result.rows.map(row => ({
            ...row,
            createdBy: {
                id: row.creatorId,
                name: row.creatorName,
                department: row.creatorDepartment
            }
        }));

        res.json({ success: true, castingCalls: formatted });
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
            `SELECT c.id, c.title, c.description, c.project_type as "projectType", 
                    c.category, c.sub_category as "subCategory", c.experience, 
                    c.country, c.state, c.city, c.last_date_to_apply as "lastDateToApply", 
                    c.service_duration as "serviceDuration", c.requirements, 
                    c.documents, c.status, c.created_at as "createdAt",
                    c.pay_rate as "payRate", c.start_date as "startDate", c.end_date as "endDate",
                    u.id as "creatorId", u.name as "creatorName", u.email as "creatorEmail", u.department as "creatorDepartment"
             FROM casting_calls c
             JOIN users u ON c.created_by = u.id
             WHERE c.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Casting call not found' });
        }

        const row = result.rows[0];
        const formatted = {
            ...row,
            createdBy: {
                id: row.creatorId,
                name: row.creatorName,
                email: row.creatorEmail,
                department: row.creatorDepartment
            }
        };

        res.json({ success: true, castingCall: formatted });
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
