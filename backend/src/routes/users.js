import express from 'express';
import { 
    acceptConnection, declineConnection, getConnectionCount, getUserStats, getRecentUsers, 
    incrementProfileViews, getUsers, getUserById, getNotifications, 
    markNotificationsRead, getProfile, sendNotification, updateProfile, getConnectedUserIds,
    deleteNotification
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public route - no auth required (for public profile pages)
router.get('/:userId/public', getUserById);

// Protected routes - Now fully secured
router.get('/', authMiddleware, getUsers);
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications/read', authMiddleware, markNotificationsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);
router.get('/profile', authMiddleware, getProfile);
router.get('/stats', authMiddleware, getUserStats);
router.get('/recent', getRecentUsers);
router.get('/connections/count', authMiddleware, getConnectionCount);
router.get('/connections/ids', authMiddleware, getConnectedUserIds);
router.post('/connections/accept', authMiddleware, acceptConnection);
router.post('/connections/decline', authMiddleware, declineConnection);
router.get('/:userId', authMiddleware, getUserById);
router.post('/:userId/notify', authMiddleware, sendNotification);
router.post('/:userId/view', authMiddleware, incrementProfileViews);
router.put('/profile', authMiddleware, updateProfile);

export default router;
