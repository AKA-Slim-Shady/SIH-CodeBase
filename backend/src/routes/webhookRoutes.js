// backend/src/routes/webhookRoutes.js

import express from 'express';
import { clerkWebhookHandler } from '../controllers/webhookController.js';

const router = express.Router();

// This is the endpoint Clerk will send messages to
router.post('/clerk', clerkWebhookHandler);

export default router;