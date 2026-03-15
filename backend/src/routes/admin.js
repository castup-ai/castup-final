import express from 'express';
import { getPlatformStats, deleteUser, deleteJob, getAllWorks, deleteWork } from '../controllers/adminController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/admin.js';

const router = express.Router();

// All admin routes require both authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getPlatformStats);
router.delete('/users/:userId', deleteUser);
router.delete('/jobs/:jobId', deleteJob);
router.get('/works', getAllWorks);
router.delete('/works/:workId', deleteWork);

export default router;
