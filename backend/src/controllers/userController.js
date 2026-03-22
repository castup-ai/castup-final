import pool from '../config/database.js';

// Search/Get all users
export const getUsers = async (req, res) => {
    try {
        const { department, search, limit = 50 } = req.query;

        let query = `
            SELECT id, name, email, department, country, phone, 
                   role, category, experience, availability, location, 
                   languages, age, gender, height, weight, next_available as "nextAvailable", 
                   bio, years_of_experience as "yearsOfExperience", awards, skills, projects_worked_on as "projectsWorkedOn", additional_skills as "additionalSkills", 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "photo", created_at as "createdAt"
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

        res.json({ success: true, data: result.rows });
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
                   bio, years_of_experience as "yearsOfExperience", awards, skills, projects_worked_on as "projectsWorkedOn", additional_skills as "additionalSkills", 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "photo", created_at as "createdAt"
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
                   bio, years_of_experience as "yearsOfExperience", awards, skills, projects_worked_on as "projectsWorkedOn", additional_skills as "additionalSkills", 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "photo", created_at as "createdAt"
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
            projectsWorkedOn: 'projects_worked_on',
            additionalSkills: 'additional_skills',
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
                   bio, years_of_experience as "yearsOfExperience", awards, skills, projects_worked_on as "projectsWorkedOn", additional_skills as "additionalSkills", 
                   portfolio_link as "portfolioLink", social_media as "socialMedia", project_type as "projectType", 
                   profile_picture as "photo", created_at as "createdAt"
        `;

        const result = await pool.query(query, values);

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, type, title, message, read, metadata, created_at as "timestamp" 
             FROM notifications 
             FROM notifications 
             WHERE user_id = $1 OR (metadata->>'senderId')::uuid = $1
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.userId]
        );

        res.json({ success: true, notifications: result.rows });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Send notification to another user (Connect/Message)
export const sendNotification = async (req, res) => {
    try {
        const { userId } = req.params; // target user
        const { type, title, message, metadata } = req.body;
        const senderId = req.userId;

        // Get sender name for the message
        const sender = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);
        const senderName = sender.rows[0]?.name || 'Someone';

        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, metadata) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [
                userId, 
                type || 'info', 
                title || 'New Notification',
                message || `${senderName} wants to connect with you`,
                JSON.stringify({ ...metadata, senderId, senderName })
            ]
        );

        res.json({ success: true, notification: result.rows[0] });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Mark notifications as read
export const markNotificationsRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET read = TRUE WHERE user_id = $1',
            [req.userId]
        );
        res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Accept a connection request - creates DB record + notifies requester
export const acceptConnection = async (req, res) => {
    try {
        const { notificationId, senderId } = req.body;
        const acceptorId = req.userId;

        if (!senderId) {
            return res.status(400).json({ error: 'senderId is required' });
        }

        // Insert connection (both directions, ignore if already exists)
        const uid1 = acceptorId < senderId ? acceptorId : senderId;
        const uid2 = acceptorId < senderId ? senderId : acceptorId;
        await pool.query(
            `INSERT INTO connections (user_id_1, user_id_2, status)
             VALUES ($1, $2, 'connected')
             ON CONFLICT (user_id_1, user_id_2) DO NOTHING`,
            [uid1, uid2]
        );

        // Mark the original notification as read and update status in metadata
        if (notificationId) {
            const currentNotif = await pool.query('SELECT metadata FROM notifications WHERE id = $1', [notificationId]);
            let metadata = {};
            if (currentNotif.rows.length > 0) {
                metadata = typeof currentNotif.rows[0].metadata === 'string' 
                    ? JSON.parse(currentNotif.rows[0].metadata || '{}') 
                    : (currentNotif.rows[0].metadata || {});
            }
            metadata.status = 'accepted';

            await pool.query(
                'UPDATE notifications SET read = TRUE, metadata = $1 WHERE id = $2 AND user_id = $3',
                [JSON.stringify(metadata), notificationId, acceptorId]
            );
        }

        // Send acceptance notification to the original requester
        const acceptor = await pool.query('SELECT name FROM users WHERE id = $1', [acceptorId]);
        const acceptorName = acceptor.rows[0]?.name || 'Someone';

        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, metadata)
             VALUES ($1, 'connect_accepted', 'Connection Accepted', $2, $3)`,
            [
                senderId,
                `${acceptorName} accepted your connection request.`,
                JSON.stringify({ senderId: acceptorId, senderName: acceptorName })
            ]
        );

        res.json({ success: true, message: 'Connection accepted' });
    } catch (error) {
        console.error('Accept connection error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Decline a connection request - marks notification as read + sets status
export const declineConnection = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.userId;

        if (!notificationId) {
            return res.status(400).json({ error: 'notificationId is required' });
        }

        const currentNotif = await pool.query('SELECT metadata FROM notifications WHERE id = $1 AND user_id = $2', [notificationId, userId]);
        if (currentNotif.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        let metadata = typeof currentNotif.rows[0].metadata === 'string' 
            ? JSON.parse(currentNotif.rows[0].metadata || '{}') 
            : (currentNotif.rows[0].metadata || {});
        metadata.status = 'declined';

        await pool.query(
            'UPDATE notifications SET read = TRUE, metadata = $1 WHERE id = $2 AND user_id = $3',
            [JSON.stringify(metadata), notificationId, userId]
        );

        res.json({ success: true, message: 'Connection declined' });
    } catch (error) {
        console.error('Decline connection error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get connection count for current user
export const getConnectionCount = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM connections
             WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'connected'`,
            [req.userId]
        );
        res.json({ success: true, count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Get connection count error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get list of connected user IDs
export const getConnectedUserIds = async (req, res) => {
    try {
        const userId = req.userId;
        const result = await pool.query(
            `SELECT CASE WHEN user_id_1 = $1 THEN user_id_2 ELSE user_id_1 END as "peerId"
             FROM connections
             WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'connected'`,
            [userId]
        );
        res.json({ success: true, ids: result.rows.map(r => r.peerId) });
    } catch (error) {
        console.error('Get connected user IDs error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get stats for the home dashboard
export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Connection count
        const connRes = await pool.query(
            `SELECT COUNT(*) as count FROM connections
             WHERE (user_id_1 = $1 OR user_id_2 = $1) AND status = 'connected'`,
            [userId]
        );

        // 2. Project count (files + portfolio items)
        const filesCount = await pool.query('SELECT COUNT(*) as count FROM files WHERE user_id = $1', [userId]);
        
        const portfolioRes = await pool.query('SELECT media FROM portfolios WHERE user_id = $1', [userId]);
        let portCount = 0;
        if (portfolioRes.rows.length > 0) {
            let media = portfolioRes.rows[0].media;
            if (typeof media === 'string') try { media = JSON.parse(media); } catch(e) { media = []; }
            if (Array.isArray(media)) portCount = media.length;
        }

        // 3. Profile views
        const viewRes = await pool.query('SELECT profile_views FROM users WHERE id = $1', [userId]);

        res.json({
            success: true,
            stats: {
                connections: parseInt(connRes.rows[0].count),
                projects: parseInt(filesCount.rows[0].count) + portCount,
                profileViews: viewRes.rows[0]?.profile_views || 0
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get recently joined users for home activity feed
export const getRecentUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, role, category, location, created_at as "createdAt"
             FROM users
             ORDER BY created_at DESC
             LIMIT 3`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get recent users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Increment profile views when someone visits a profile
export const incrementProfileViews = async (req, res) => {
    try {
        const { userId } = req.params;
        // Don't increment if user is viewing their own profile (optional check)
        if (req.userId === userId) return res.json({ success: true, message: 'Self view' });

        await pool.query(
            'UPDATE users SET profile_views = profile_views + 1 WHERE id = $1',
            [userId]
        );
        res.json({ success: true, message: 'View counted' });
    } catch (error) {
        console.error('Increment views error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

