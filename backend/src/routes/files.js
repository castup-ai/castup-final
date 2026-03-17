import express from 'express';
import multer from 'multer';
import { uploadFile, uploadFromUrl, getUserFiles, shareFile, getSharedFiles } from '../controllers/fileController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads (Memory storage for Cloud compatibility)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Protected routes
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/url', authMiddleware, uploadFromUrl);
router.get('/', authMiddleware, getUserFiles);
router.post('/:fileId/share', authMiddleware, shareFile);
router.get('/shared', authMiddleware, getSharedFiles);

export default router;
