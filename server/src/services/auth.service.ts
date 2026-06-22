import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { findAdminByEmail, findAdminById, updateAdmin } from '../repositories/admin.repository.js';
import { createSession, findSession, updateSession, revokeSession, revokeAllSessions } from '../repositories/session.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { comparePassword } from '../utils/password.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditEvent, AuditSeverity, AdminStatus, Prisma } from '@prisma/client';
import type { LoginRequest } from '../validators/auth.validator.js';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
  };
}

/**
 * Handles the login process: validation, password check, lockout enforcement, session creation, and tokens.
 */
export async function login(
  data: LoginRequest,
  ipAddress: string | null,
  userAgent: string | null
): Promise<AuthResponse> {
  const admin = await findAdminByEmail(data.email);

  // Prevent timing attacks by running a mock compare if the admin doesn't exist
  if (!admin) {
    await comparePassword('dummy_password', '$2b$12$TCpXEhLS9C6MPDXSBAn7cOTO6JrUpzVO6wqheTNdYjUtBKsLjG5du');
    throw new AppError('Invalid email or password', 401, { auth: ['invalid_credentials'] });
  }

  // Check lockout status
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const diffMs = admin.lockedUntil.getTime() - Date.now();
    const diffMins = Math.ceil(diffMs / 60000);
    throw new AppError(
      `Account is temporarily locked due to consecutive failed login attempts. Try again in ${diffMins} minutes.`,
      403,
      { auth: ['account_locked'] }
    );
  }

  // Compare passwords
  const passwordMatch = await comparePassword(data.password, admin.hashedPassword);

  if (!passwordMatch) {
    const attempts = admin.failedLoginAttempts + 1;
    const updateData: Prisma.AdminUpdateInput = { failedLoginAttempts: attempts };
    let isLocked = false;

    if (attempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      updateData.failedLoginAttempts = 0; // reset counter on lockout
      isLocked = true;
    }

    await updateAdmin(admin.id, updateData);

    // Audit logging for failed attempt
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.LOGIN,
        actorName: null,
        details: isLocked
          ? `Admin account temporarily locked due to 5 consecutive failed login attempts. Email: ${admin.email}, IP: ${ipAddress}`
          : `Failed login attempt for admin email: ${admin.email} from IP: ${ipAddress}`,
        ipAddress,
        severity: isLocked ? AuditSeverity.CRITICAL : AuditSeverity.WARNING,
      },
    });

    throw new AppError('Invalid email or password', 401, { auth: ['invalid_credentials'] });
  }

  // Verify status is ACTIVE
  if (admin.status !== AdminStatus.ACTIVE) {
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.LOGIN,
        actorName: admin.name,
        details: `Failed login attempt: inactive admin account. Email: ${admin.email}, IP: ${ipAddress}`,
        ipAddress,
        severity: AuditSeverity.WARNING,
        adminId: admin.id,
      },
    });
    throw new AppError('Admin account is inactive', 401, { auth: ['inactive_account'] });
  }

  // Successful login: Reset stats
  await updateAdmin(admin.id, {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    lastLoginIp: ipAddress,
  });

  // Pre-generate session ID (UUID format works perfectly in String ID fields)
  const sessionId = crypto.randomUUID();

  // Create JWT tokens
  const refreshToken = signRefreshToken({ sub: admin.id, sessionId });
  const accessToken = signAccessToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    sessionId,
  });

  // Hash the refresh token using SHA-256 for secure DB storage
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Store the session in DB
  await createSession({
    adminId: admin.id,
    hashedToken,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
  });

  // Audit log for successful login
  await prisma.auditLog.create({
    data: {
      event: AuditEvent.LOGIN,
      actorName: admin.name,
      details: `Admin logged in successfully from IP: ${ipAddress}`,
      ipAddress,
      severity: AuditSeverity.INFO,
      adminId: admin.id,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}

/**
 * Handles the token refresh process, enforcing Refresh Token Rotation (RTR) and replay attack detection.
 */
export async function refresh(
  token: string,
  ipAddress: string | null,
  _userAgent: string | null
): Promise<AuthResponse> {
  try {
    verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid token', 401);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const session = await findSession(hashedToken);

  // If session is not found in database:
  if (!session) {
    throw new AppError('Invalid session', 401);
  }

  // Replay Attack Prevention
  if (session.revokedAt !== null) {
    // Revoked token reused! Revoke ALL active sessions for this admin ID
    await revokeAllSessions(session.adminId);

    await prisma.auditLog.create({
      data: {
        event: AuditEvent.SYSTEM,
        actorName: session.admin.name,
        details: `Potential refresh token reuse/replay attack detected for admin ID: ${session.adminId}. Revoking all sessions.`,
        ipAddress,
        severity: AuditSeverity.CRITICAL,
        adminId: session.adminId,
      },
    });

    throw new AppError('Session revoked', 401);
  }

  // Session Expiry check
  if (session.expiresAt < new Date()) {
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.SYSTEM,
        actorName: session.admin.name,
        details: `Expired session verification attempted. Session ID: ${session.id}`,
        ipAddress,
        severity: AuditSeverity.WARNING,
        adminId: session.adminId,
      },
    });
    throw new AppError('Session expired', 401);
  }

  // Admin active state check
  if (session.admin.status !== AdminStatus.ACTIVE || session.admin.deletedAt !== null) {
    throw new AppError('Admin account is inactive', 401);
  }

  // Refresh Token Rotation: generate a new refresh token and access token
  const newRefreshToken = signRefreshToken({ sub: session.adminId, sessionId: session.id });
  const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  // Update session in DB with rotated token and slide expiry by 7 days
  await updateSession(session.id, {
    hashedToken: newHashedToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const newAccessToken = signAccessToken({
    sub: session.admin.id,
    email: session.admin.email,
    role: session.admin.role,
    sessionId: session.id,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      role: session.admin.role,
    },
  };
}

/**
 * Handles explicit user logout by revoking the current session.
 */
export async function logout(
  sessionId: string,
  adminId: string,
  ipAddress: string | null
): Promise<void> {
  const admin = await findAdminById(adminId);
  await revokeSession(sessionId);

  await prisma.auditLog.create({
    data: {
      event: AuditEvent.LOGOUT,
      actorName: admin ? admin.name : 'Unknown Admin',
      details: `Admin logged out successfully. Session ID: ${sessionId}`,
      ipAddress,
      severity: AuditSeverity.INFO,
      adminId,
    },
  });
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
}

/**
 * Returns latest active admin info.
 */
export async function me(adminId: string): Promise<MeResponse> {
  const admin = await findAdminById(adminId);
  if (!admin || admin.status !== AdminStatus.ACTIVE) {
    throw new AppError('Admin account not found', 401);
  }
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}
