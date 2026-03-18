import { Router } from 'express';
import { getStats, getLanguages } from '../controllers/github.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/user-stats/:username', requireAuth, getStats);
router.get('/languages/:username', requireAuth, getLanguages);

export default router;
