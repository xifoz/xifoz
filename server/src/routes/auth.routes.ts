import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { loginRateLimiter, totpLimiter, backupCodeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Dynamic rate limiter for POST /2fa/login.
 * Routes to the backup-code limiter (tighter) when the code matches the
 * XXXX-XXXX-XXXX pattern; otherwise applies the TOTP limiter.
 * The loginRateLimiter is also applied as a base-level IP guard.
 */
const BACKUP_CODE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function mfaLoginLimiter(req: Request, res: Response, next: NextFunction): void {
  const code: string = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  const limiter = BACKUP_CODE_PATTERN.test(code) ? backupCodeLimiter : totpLimiter;
  limiter(req, res, next);
}

// ── Existing auth endpoints ───────────────────────────────────────────────────
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

// ── 2FA management (protected – require a valid session) ──────────────────────
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/verify', authenticate, authController.verify2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);
router.get('/2fa/status', authenticate, authController.getStatus2FA);
router.post('/2fa/regenerate-backup-codes', authenticate, authController.regenerateBackupCodes);

// ── 2FA login completion (public – challenge token acts as the credential) ─────
// Uses dynamic TOTP/backup-code limiters instead of the generic loginRateLimiter.
router.post('/2fa/login', mfaLoginLimiter, authController.loginVerify2FA);

export default router;
