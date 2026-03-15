import pool from '../config/database.js';

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

// Get all works (files)
export const getAllWorks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, u.name as "ownerName", u.email as "ownerEmail"
            FROM files f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get all works error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete a work entry
export const deleteWork = async (req, res) => {
    try {
        const { workId } = req.params;

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
