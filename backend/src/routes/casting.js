import express from 'express';
import { createCastingCall, getCastingCalls, getCastingCallById, applyToCastingCall, getCastingCallApplicants, deleteCastingCall, updateCastingCall } from '../controllers/castingController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes - Now fully secured
router.post('/', authMiddleware, createCastingCall);
router.get('/', authMiddleware, getCastingCalls);
router.get('/applications/me', authMiddleware, (req, res, next) => {
    // This is a placeholder for the controller we're about to add
    import('../controllers/castingController.js').then(m => m.getMyApplications(req, res));
});
router.get('/:id', authMiddleware, getCastingCallById);
router.post('/:id/apply', authMiddleware, applyToCastingCall);
router.get('/:id/applicants', authMiddleware, getCastingCallApplicants);
router.delete('/:id', authMiddleware, deleteCastingCall);
router.put('/:id', authMiddleware, updateCastingCall);

export default router;
