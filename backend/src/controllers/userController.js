import pool from '../config/database.js';

// Search/Get all users
export const getUsers = async (req, res) => {
    try {
        const { department, search, limit = 50 } = req.query;

        let query = `
            SELECT u.id, u.name, u.email, u.department, u.profile_picture, u.created_at,
                   p.bio, p.skills
            FROM users u
            LEFT JOIN portfolios p ON u.id = p.user_id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (department) {
            query += ` AND u.department = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (search) {
            query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY u.created_at DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);

        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.department, u.profile_picture, u.created_at,
                    p.bio, p.experience, p.skills, p.media, p.external_links
             FROM users u
             LEFT JOIN portfolios p ON u.id = p.user_id
             WHERE u.id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, department, profilePicture } = req.body;

        console.log('📥 Update Profile Request:', {
            userId: req.userId,
            hasName: !!name,
            hasDepartment: !!department,
            hasProfilePicture: !!profilePicture,
            profilePictureLength: profilePicture?.length || 0
        });

        // Build dynamic update query based on what's provided
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (department !== undefined) {
            updates.push(`department = $${paramCount}`);
            values.push(department);
            paramCount++;
        }

        if (profilePicture !== undefined) {
            updates.push(`profile_picture = $${paramCount}`);
            values.push(profilePicture);
            paramCount++;
        }

        // Always update the timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add userId as last parameter
        values.push(req.userId);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, email, name, department, profile_picture
        `;

        console.log('🔄 Executing query with', updates.length, 'updates');

        const result = await pool.query(query, values);

        console.log('✅ Profile updated successfully:', {
            userId: result.rows[0].id,
            hasProfilePicture: !!result.rows[0].profile_picture
        });

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
