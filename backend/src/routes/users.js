import express from 'express';
import { 
    getUsers, getUserById, updateProfile, getProfile, 
    getNotifications, sendNotification, markNotificationsRead 
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes - Now fully secured
router.get('/', authMiddleware, getUsers);
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read', authMiddleware, markNotificationsRead);
router.get('/profile', authMiddleware, getProfile);
router.get('/:userId', authMiddleware, getUserById);
router.post('/:userId/notify', authMiddleware, sendNotification);
router.put('/profile', authMiddleware, updateProfile);

export default router;
