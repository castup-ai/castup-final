import express from 'express';
import { createCastingCall, getCastingCalls, getCastingCallById, applyToCastingCall } from '../controllers/castingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createCastingCall);
router.get('/', getCastingCalls);
router.get('/:id', getCastingCallById);
router.post('/:id/apply', authMiddleware, applyToCastingCall);

export default router;
