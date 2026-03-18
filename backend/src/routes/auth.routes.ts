import { Router } from 'express';
import { githubOAuthURL, githubOAuthCallback, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/github', githubOAuthURL);
router.get('/github/callback', githubOAuthCallback);
router.get('/me', requireAuth, getMe);

export default router;
