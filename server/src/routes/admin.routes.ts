import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Protect all admin endpoints with the authentication middleware
router.use(authenticate);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/contacts', adminController.getContacts);
router.patch('/contacts/:id', adminController.updateContactStatus);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/users', requireRole([AdminRole.SUPER_ADMIN]), adminController.getAdminUsers);
router.get('/settings', adminController.getSystemSettings);
router.patch('/settings', requireRole([AdminRole.SUPER_ADMIN]), adminController.updateSystemSettings);

export default router;
