import pool from '../config/database.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file from computer
export const uploadFile = async (req, res) => {
    try {
        const { name, description } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'castup/files',
            resource_type: 'auto'
        });

        // Save to database
        const dbResult = await pool.query(
            `INSERT INTO files (user_id, name, description, source_type, file_url) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [req.userId, name || file.originalname, description, 'computer', result.secure_url]
        );

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: dbResult.rows[0]
        });
    } catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({ error: 'Server error during file upload' });
    }
};

// Upload from URL (YouTube/Instagram)
export const uploadFromUrl = async (req, res) => {
    try {
        const { name, description, sourceType, sourceUrl } = req.body;

        if (!sourceUrl || !sourceType) {
            return res.status(400).json({ error: 'Source URL and type are required' });
        }

        // Validate source type
        if (!['youtube', 'instagram'].includes(sourceType)) {
            return res.status(400).json({ error: 'Invalid source type' });
        }

        // Save to database
        const result = await pool.query(
            `INSERT INTO files (user_id, name, description, source_type, source_url) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [req.userId, name, description, sourceType, sourceUrl]
        );

        res.json({
            success: true,
            message: 'File saved successfully',
            file: result.rows[0]
        });
    } catch (error) {
        console.error('Upload from URL error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user's files
export const getUserFiles = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM files WHERE user_id = $1 ORDER BY created_at DESC',
            [req.userId]
        );

        res.json({ success: true, files: result.rows });
    } catch (error) {
        console.error('Get user files error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Share file
export const shareFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { userIds } = req.body;

        // Verify file ownership
        const fileResult = await pool.query(
            'SELECT * FROM files WHERE id = $1 AND user_id = $2',
            [fileId, req.userId]
        );

        if (fileResult.rows.length === 0) {
            return res.status(404).json({ error: 'File not found or access denied' });
        }

        // Update shared_with
        await pool.query(
            'UPDATE files SET shared_with = $1 WHERE id = $2',
            [userIds, fileId]
        );

        res.json({ success: true, message: 'File shared successfully' });
    } catch (error) {
        console.error('Share file error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get shared files
export const getSharedFiles = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM files WHERE $1 = ANY(shared_with) ORDER BY created_at DESC',
            [req.userId]
        );

        res.json({ success: true, files: result.rows });
    } catch (error) {
        console.error('Get shared files error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
