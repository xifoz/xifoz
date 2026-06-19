import { Router } from 'express';
import { handleContactSubmission } from '../controllers/contact.controller.js';
import { contactRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', contactRateLimiter, handleContactSubmission);

export default router;
