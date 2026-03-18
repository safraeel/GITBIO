import { Router } from 'express';
import express from 'express';
import { checkout, webhook } from '../controllers/stripe.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-checkout', requireAuth, checkout);
// Webhook needs raw body parser, often set up in main index.ts
router.post('/webhook', express.raw({type: 'application/json'}), webhook);

export default router;
