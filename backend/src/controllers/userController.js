import pool from '../config/database.js';

// Search/Get all users
export const getUsers = async (req, res) => {
    try {
        const { department, search, limit = 50 } = req.query;

        let query = `
            SELECT id, name, email, department, country, phone, 
                   role, category, experience, availability, location, 
                   languages, age, gender, height, weight, next_available as "nextAvailable", 
                   bio, years_of_experience as "yearsOfExperience", awards, skills, 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "profilePicture", created_at as "createdAt"
            FROM users
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (department) {
            query += ` AND department = $${paramCount}`;
            params.push(department);
            paramCount++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await pool.query(query, params);

        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user by ID (also maps extended fields)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT id, name, email, department, country, phone, 
                   role, category, experience, availability, location, 
                   languages, age, gender, height, weight, next_available as "nextAvailable", 
                   bio, years_of_experience as "yearsOfExperience", awards, skills, 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "profilePicture", created_at as "createdAt"
             FROM users
             WHERE id = $1`,
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

// Get current logged-in user's full profile
export const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, department, country, phone, 
                   role, category, experience, availability, location, 
                   languages, age, gender, height, weight, next_available as "nextAvailable", 
                   bio, years_of_experience as "yearsOfExperience", awards, skills, 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "profilePicture", created_at as "createdAt"
             FROM users
             WHERE id = $1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile with mass dynamic fields
export const updateProfile = async (req, res) => {
    try {
        const body = req.body;
        
        // Define mapping between JS camelCase body fields and SQL snake_case columns
        const fieldMap = {
            name: 'name', 
            department: 'department', 
            country: 'country',
            phone: 'phone',
            role: 'role', 
            category: 'category', 
            experience: 'experience', 
            availability: 'availability', 
            location: 'location', 
            languages: 'languages', 
            age: 'age', 
            gender: 'gender', 
            height: 'height', 
            weight: 'weight', 
            nextAvailable: 'next_available', 
            bio: 'bio', 
            yearsOfExperience: 'years_of_experience', 
            awards: 'awards', 
            skills: 'skills', 
            portfolioLink: 'portfolio_link', 
            socialMedia: 'social_media', 
            projectType: 'project_type',
            profilePicture: 'profile_picture' // For backward compatibility if used later
        };

        const updates = [];
        const values = [];
        let paramCount = 1;

        // Auto-generate SQL updates based on provided fields
        for (const [jsField, sqlCol] of Object.entries(fieldMap)) {
            if (body[jsField] !== undefined) {
                updates.push(`${sqlCol} = $${paramCount}`);
                values.push(body[jsField] === '' ? null : body[jsField]); // Empty strings normally become NULL
                paramCount++;
            }
        }
        
        // Handle standalone profile_picture if 'photo' was passed correctly
        if (body.photo !== undefined) {
             updates.push(`profile_picture = $${paramCount}`);
             values.push(body.photo);
             paramCount++;
        }

        // Always update the timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Ensure there is at least something to update
        if (updates.length === 1) { // Only updated_at is there
             return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        // Add userId as last parameter
        values.push(req.userId);

        const query = `
            UPDATE users 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, email, department, country, phone, 
                   role, category, experience, availability, location, 
                   languages, age, gender, height, weight, next_available as "nextAvailable", 
                   bio, years_of_experience as "yearsOfExperience", awards, skills, 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "profilePicture", created_at as "createdAt"
        `;

        const result = await pool.query(query, values);

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
