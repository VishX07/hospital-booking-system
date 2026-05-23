import { Router } from 'express';
import { getPublicStats } from './stats.controller.js';

const router = Router();

// ******** PUBLIC STATS ******** //
router.get('/public', getPublicStats);

export default router;
