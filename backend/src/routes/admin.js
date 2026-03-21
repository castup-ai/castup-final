import express from 'express';
import { 
    getPlatformStats, deleteUser, deleteJob, getAllWorks, deleteWork,
    getContactMessages, updateContactStatus, replyToContactMessage
} from '../controllers/adminController.js';
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
router.get('/contacts', getContactMessages);
router.patch('/contacts/:messageId', updateContactStatus);
router.post('/contacts/:messageId/reply', replyToContactMessage);

export default router;
