import express from 'express';
import { createOrUpdatePortfolio, getPortfolio, getMyPortfolio } from '../controllers/portfolioController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, createOrUpdatePortfolio);
router.get('/me', authMiddleware, getMyPortfolio);
router.get('/:userId', getPortfolio);

export default router;
