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

        // Sanitize documents — strip any base64 data, keep only name/url/type
        const safeDocs = Array.isArray(documents)
            ? documents.map(d => ({ name: d.name || '', url: d.url || '', type: d.type || '' }))
            : [];

        // serviceDuration must be a plain object (pg handles JSONB natively)
        const safeServiceDuration = serviceDuration && typeof serviceDuration === 'object'
            ? serviceDuration
            : {};

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
                safeLastDate, JSON.stringify(safeServiceDuration), 
                JSON.stringify(requirements || ''), JSON.stringify(safeDocs),
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
        const userId = req.userId;

        // Verify job exists
        const castingCall = await pool.query('SELECT id FROM casting_calls WHERE id = $1', [id]);
        if (castingCall.rows.length === 0) {
            return res.status(404).json({ error: 'Casting call not found' });
        }

        // Insert into job_applications
        await pool.query(
            `INSERT INTO job_applications (job_id, user_id, message) 
             VALUES ($1, $2, $3)
             ON CONFLICT (job_id, user_id) 
             DO UPDATE SET message = EXCLUDED.message`,
            [id, userId, message]
        );

        res.json({ success: true, message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Apply to casting call error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get applicants for a casting call (only for creator)
export const getCastingCallApplicants = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Get casting call and verify ownership
        const jobRes = await pool.query(
            'SELECT created_by FROM casting_calls WHERE id = $1',
            [id]
        );

        if (jobRes.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
        
        if (jobRes.rows[0].created_by !== userId) {
            return res.status(403).json({ error: 'Unauthorized to view applicants for this job' });
        }

        // Fetch applications joining with users
        const appRes = await pool.query(
            `SELECT a.id, a.message, a.status, a.created_at as "appliedAt", a.user_id as "userId",
                    u.name, u.lastName, u.profile_picture as "photo", u.role, u.department
             FROM job_applications a
             JOIN users u ON a.user_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.created_at DESC`,
            [id]
        );

        const applicants = appRes.rows.map(row => ({
            ...row,
            user: {
                id: row.userId,
                name: `${row.name} ${row.lastName || ''}`.trim(),
                photo: row.photo,
                role: row.role,
                department: row.department
            }
        }));

        res.json({ success: true, applicants });
    } catch (error) {
        console.error('Get applicants error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete casting call (Owner or Admin)
export const deleteCastingCall = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Check if job exists and get creator
        const jobRes = await pool.query('SELECT created_by FROM casting_calls WHERE id = $1', [id]);
        if (jobRes.rows.length === 0) {
            return res.status(404).json({ error: 'Casting call not found' });
        }

        const creatorId = jobRes.rows[0].created_by;

        // Verify ownership (or could add admin check here if needed)
        if (creatorId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this casting call' });
        }

        await pool.query('DELETE FROM casting_calls WHERE id = $1', [id]);
        
        res.json({ success: true, message: 'Casting call deleted successfully' });
    } catch (error) {
        console.error('Delete casting call error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
