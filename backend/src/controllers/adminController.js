import pool from '../config/database.js';
import { sendEmail } from '../utils/email.js';

// Get platform-wide stats
export const getPlatformStats = async (req, res) => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const jobsCount = await pool.query('SELECT COUNT(*) FROM casting_calls');
        const artistsCount = await pool.query("SELECT COUNT(*) FROM users WHERE category = 'Artist'");
        const crewCount = await pool.query("SELECT COUNT(*) FROM users WHERE category = 'Crew'");
        const availableCount = await pool.query("SELECT COUNT(*) FROM users WHERE availability = 'Immediately'");

        res.json({
            success: true,
            stats: {
                totalUsers: parseInt(usersCount.rows[0].count),
                totalJobs: parseInt(jobsCount.rows[0].count),
                totalArtists: parseInt(artistsCount.rows[0].count),
                totalCrew: parseInt(crewCount.rows[0].count),
                immediatelyAvailable: parseInt(availableCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent self-deletion if needed, but for now we trust the admin email middleware
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: `User ${result.rows[0].email} and associated data deleted successfully`
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a job posting
export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const result = await pool.query('DELETE FROM casting_calls WHERE id = $1 RETURNING title', [jobId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job posting not found' });
        }

        res.json({
            success: true,
            message: `Job posting "${result.rows[0].title}" deleted successfully`
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all works (files + portfolio media)
export const getAllWorks = async (req, res) => {
    try {
        // Get files from files table
        const filesResult = await pool.query(`
            SELECT f.id, f.name, f.file_url, f.file_type, f.source_type, f.created_at, f.user_id,
                   u.name as "ownerName", u.email as "ownerEmail"
            FROM files f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `);

        // Get portfolio media and flatten it
        const portfolioResult = await pool.query(`
            SELECT p.media, u.name as "ownerName", u.email as "ownerEmail", u.id as "user_id"
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            WHERE p.media IS NOT NULL
        `);

        const portfolioWorks = [];
        portfolioResult.rows.forEach(row => {
            let media = row.media;
            if (typeof media === 'string') {
                try { media = JSON.parse(media); } catch(e) { media = []; }
            }
            if (Array.isArray(media)) {
                media.forEach(item => {
                    // Map portfolio item to "file" structure
                    portfolioWorks.push({
                        id: item.id || `port_\${item.title}_\${row.user_id}`,
                        name: item.title,
                        file_url: item.files && item.files.length > 0 ? item.files[0].data : null,
                        file_type: item.files && item.files.length > 0 ? item.files[0].type : 'portfolio/item',
                        source_type: item.type || 'Portfolio',
                        created_at: item.createdAt || new Date().toISOString(),
                        ownerName: row.ownerName,
                        ownerEmail: row.ownerEmail,
                        user_id: row.user_id, // Important for deletion
                        is_portfolio: true,
                        all_files: item.files // For detailed view
                    });
                });
            }
        });

        // Merge and sort
        const allWorks = [...filesResult.rows, ...portfolioWorks].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.json({
            success: true,
            data: allWorks
        });
    } catch (error) {
        console.error('Get all works error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a work entry (File or Portfolio Item)
export const deleteWork = async (req, res) => {
    try {
        const { workId } = req.params;

        // Check if it's a portfolio item
        if (workId.startsWith('port_') || req.query.isPortfolio === 'true') {
            const userId = req.query.userId;
            if (!userId) {
                return res.status(400).json({ error: 'User ID required to delete portfolio work' });
            }

            // Get portfolio
            const pRes = await pool.query('SELECT media FROM portfolios WHERE user_id = $1', [userId]);
            if (pRes.rows.length === 0) return res.status(404).json({ error: 'Portfolio not found' });

            let media = pRes.rows[0].media;
            if (typeof media === 'string') media = JSON.parse(media);
            
            // Filter out the work. We use both ID and possibly Title if ID is generated.
            const newMedia = media.filter(m => m.id !== workId && `port_\${m.title}_\${userId}` !== workId);
            
            if (newMedia.length === media.length) {
                return res.status(404).json({ error: 'Work item not found in portfolio' });
            }

            await pool.query('UPDATE portfolios SET media = $1 WHERE user_id = $2', [JSON.stringify(newMedia), userId]);

            return res.json({ success: true, message: 'Portfolio work deleted' });
        }

        // Standard file deletion
        const result = await pool.query('DELETE FROM files WHERE id = $1 RETURNING name', [workId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work entry not found' });
        }

        res.json({
            success: true,
            message: `Work "${result.rows[0].name}" deleted successfully`
        });
    } catch (error) {
        console.error('Delete work error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all contact messages
export const getContactMessages = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update contact message status
export const updateContactStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE contact_messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, messageId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reply to a contact message
export const replyToContactMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { replyMessage } = req.body;

        if (!replyMessage) {
            return res.status(400).json({ error: 'Reply message is required' });
        }

        // Get the original message
        const messageRes = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [messageId]);
        if (messageRes.rows.length === 0) {
            return res.status(404).json({ error: 'Original message not found' });
        }
        const originalMsg = messageRes.rows[0];

        // 1. Mark as replied (core operation - always runs)
        await pool.query('UPDATE contact_messages SET status = $1 WHERE id = $2', ['replied', messageId]);

        // 2. Store reply text (safe - skip if column missing)
        try {
            await pool.query('UPDATE contact_messages SET reply_text = $1 WHERE id = $2', [replyMessage, messageId]);
        } catch (_) {}

        // 3. Try to deliver in-app notification if user has an account
        let delivered = false;
        try {
            const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [originalMsg.email]);
            if (userRes.rows.length > 0) {
                const targetUserId = userRes.rows[0].id;
                await pool.query(
                    `INSERT INTO notifications (user_id, type, title, message, metadata)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        targetUserId,
                        'message',
                        `Admin Reply: ${originalMsg.subject || 'Support Request'}`,
                        replyMessage,
                        JSON.stringify({ senderId: req.userId || 'admin', senderName: 'Admin Support', is_admin_reply: true })
                    ]
                );
                delivered = true;
            }
        } catch (notifErr) {
            console.warn('Could not send in-app notification:', notifErr.message);
        }

        res.json({
            success: true,
            message: delivered ? 'Reply saved and sent to user inbox' : 'Reply saved (user not registered in app)'
        });

    } catch (error) {
        console.error('Reply to contact error:', error);
        res.status(500).json({ error: error.message });
    }
};


