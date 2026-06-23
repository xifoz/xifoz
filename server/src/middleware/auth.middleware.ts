import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';
import { AdminStatus, AdminRole, AuditEvent, AuditSeverity } from '@prisma/client';
import type { ApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to authenticate requests using a Bearer token.
 * Verifies the JWT signature, session status, and admin status.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication token required',
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      const errorObject = err as { name?: string };
      if (errorObject.name === 'TokenExpiredError') {
        // Log expired access token to console
        logger.warn('Access token expired', { ipAddress: req.ip || null });

        const response: ApiResponse = {
          success: false,
          message: 'Access token expired',
          errors: { auth: ['token_expired'] },
        };
        res.status(401).json(response);
        return;
      }

      // Log invalid access token attempt to console
      logger.warn('Invalid access token verification failed', { ipAddress: req.ip || null });

      const response: ApiResponse = {
        success: false,
        message: 'Invalid token',
      };
      res.status(401).json(response);
      return;
    }

    // Verify Session in DB
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session) {
      const response: ApiResponse = {
        success: false,
        message: 'Session not found',
      };
      res.status(401).json(response);
      return;
    }

    if (session.revokedAt !== null) {
      // Log warning for revoked session usage to console
      logger.warn(`Revoked session access attempted. Session ID: ${session.id}`, {
        ipAddress: req.ip || null,
        adminId: session.adminId,
      });

      const response: ApiResponse = {
        success: false,
        message: 'Session revoked',
      };
      res.status(401).json(response);
      return;
    }

    if (session.expiresAt < new Date()) {
      // Log expired session access to console
      logger.warn(`Expired session access attempted. Session ID: ${session.id}`, {
        ipAddress: req.ip || null,
        adminId: session.adminId,
      });

      const response: ApiResponse = {
        success: false,
        message: 'Session expired',
      };
      res.status(401).json(response);
      return;
    }

    // Verify Admin in DB
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || admin.deletedAt !== null) {
      const response: ApiResponse = {
        success: false,
        message: 'Admin account not found',
      };
      res.status(401).json(response);
      return;
    }

    // Verify that session adminId matches retrieved admin id
    if (session.adminId !== admin.id) {
      const response: ApiResponse = {
        success: false,
        message: 'Session not found',
      };
      res.status(401).json(response);
      return;
    }

    if (admin.status !== AdminStatus.ACTIVE) {
      // Log inactive admin access to console
      logger.warn(`Inactive admin account access attempted. Admin ID: ${admin.id}`, {
        ipAddress: req.ip || null,
        adminId: admin.id,
      });

      const response: ApiResponse = {
        success: false,
        message: 'Admin account is inactive',
      };
      res.status(401).json(response);
      return;
    }

    // Attach req.user with expected shape
    req.user = {
      adminId: admin.id,
      sessionId: session.id,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware. Never blocks requests or returns HTTP 401.
 * Continues anonymously if token is invalid, expired, revoked, or admin is disabled.
 */
export async function authenticateOptional(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      next();
      return;
    }

    // Verify Session in DB
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      next();
      return;
    }

    // Verify Admin in DB
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || admin.deletedAt !== null || admin.status !== AdminStatus.ACTIVE || session.adminId !== admin.id) {
      next();
      return;
    }

    // Attach req.user
    req.user = {
      adminId: admin.id,
      sessionId: session.id,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch {
    next();
  }
}

/**
 * Middleware to restrict access to specific Admin roles.
 * Must be executed after authenticate.
 */
export function requireRole(allowedRoles: AdminRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
        };
        res.status(401).json(response);
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        // Create an audit log entry for unauthorized access attempt
        await prisma.auditLog.create({
          data: {
            event: AuditEvent.SYSTEM,
            severity: AuditSeverity.WARNING,
            details: `Unauthorized route access attempted by admin ${req.user.email} on path ${req.method} ${req.path}`,
            ipAddress: req.ip || null,
            adminId: req.user.adminId,
          },
        });

        const response: ApiResponse = {
          success: false,
          message: 'Access denied: Insufficient privileges',
        };
        res.status(403).json(response);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
