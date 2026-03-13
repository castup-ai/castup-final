import express from 'express';
import { createCastingCall, getCastingCalls, getCastingCallById, applyToCastingCall } from '../controllers/castingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes - Now fully secured
router.post('/', authMiddleware, createCastingCall);
router.get('/', authMiddleware, getCastingCalls);
router.get('/:id', authMiddleware, getCastingCallById);
router.post('/:id/apply', authMiddleware, applyToCastingCall);

export default router;
