import express from 'express';
import { getUsers, getUserById, updateProfile, getProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/', getUsers);
router.get('/profile', authMiddleware, getProfile);
router.get('/:userId', getUserById);
router.put('/profile', authMiddleware, updateProfile);

export default router;
