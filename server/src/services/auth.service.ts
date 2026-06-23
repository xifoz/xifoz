import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { findAdminByEmail, findAdminById, updateAdmin } from '../repositories/admin.repository.js';
import { createSession, findSession, revokeSession, revokeAllSessions } from '../repositories/session.repository.js';
import { createMfaChallenge, deleteExpiredMfaChallenges } from '../repositories/mfaChallenge.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { comparePassword } from '../utils/password.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuditEvent, AuditSeverity, AdminStatus, Prisma } from '@prisma/client';
import type { LoginRequest } from '../validators/auth.validator.js';
import { OTP } from 'otplib';
import QRCode from 'qrcode';
import { logger } from '../utils/logger.js';

const otp = new OTP({ strategy: 'totp' });
const OTP_EPOCH_TOLERANCE = 30; // ±30s = window 1

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
  };
}

export type LoginResponse =
  | {
      mfaRequired: false;
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
      };
    }
  | {
      mfaRequired: true;
      challengeToken: string;
    };

/**
 * Hashing utility (SHA-256)
 */
function hashSHA256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Constant-time comparison for hex hashes
 */
function safeCompareHashes(hashA: string, hashB: string): boolean {
  const bufA = Buffer.from(hashA, 'hex');
  const bufB = Buffer.from(hashB, 'hex');
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Alphanumeric recovery code generator in format XXXX-XXXX-XXXX
 */
function generateBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-';
    }
    code += chars[crypto.randomInt(chars.length)];
  }
  return code;
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
}

/**
 * Handles the login process: validation, password check, lockout enforcement, and challenge token creation if MFA is enabled.
 */
export async function login(
  data: LoginRequest,
  ipAddress: string | null,
  userAgent: string | null
): Promise<LoginResponse> {
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

  // Clean up expired challenges
  await deleteExpiredMfaChallenges();

  // Check if Two-Factor Authentication is enabled
  if (admin.twoFactorEnabled) {
    // Generate a secure 256-bit challenge token (32 bytes as hex = 64 characters)
    const challengeToken = crypto.randomBytes(32).toString('hex');
    const hashedChallengeToken = hashSHA256(challengeToken);

    // Store only the SHA-256 hash of the token in the database
    await createMfaChallenge({
      adminId: admin.id,
      hashedToken: hashedChallengeToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
    });

    return {
      mfaRequired: true,
      challengeToken,
    };
  }

  // Successful login without MFA: Reset stats
  await updateAdmin(admin.id, {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    lastLoginIp: ipAddress,
  });

  // Pre-generate session ID (UUID format)
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
  const hashedToken = hashSHA256(refreshToken);

  // Store the session in DB
  await createSession({
    id: sessionId,
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
    mfaRequired: false,
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
 * Validates the MFA challenge and verifies the code (TOTP or backup code).
 * Issues tokens and session details on success, wrapping all DB mutations in a single transaction.
 */
export async function loginVerify2FA(
  data: { challengeToken: string; code: string },
  ipAddress: string | null,
  userAgent: string | null
): Promise<AuthResponse> {
  const hashedChallengeToken = hashSHA256(data.challengeToken);
  
  // Perform all database queries and updates atomically
  return prisma.$transaction(async (tx) => {
    // 1. Lookup the challenge first so we can distinguish expired vs invalid
    const challenge = await tx.mfaChallenge.findUnique({
      where: { hashedToken: hashedChallengeToken },
    });

    // 2. Clean up all other expired challenges (housekeeping)
    await tx.mfaChallenge.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (!challenge) {
      logger.warn(`Invalid MFA challenge token validation attempt from IP: ${ipAddress}`);
      throw new AppError('Invalid or consumed MFA challenge', 401);
    }

    // 3. Expiry check — challenge may have been removed by the deleteMany above
    if (challenge.expiresAt < new Date()) {
      // Ensure it is deleted (may already be gone from deleteMany above)
      await tx.mfaChallenge.deleteMany({ where: { id: challenge.id } });
      logger.warn(`Expired MFA challenge token presented from IP: ${ipAddress}`, {
        adminId: challenge.adminId,
      });
      throw new AppError('MFA challenge has expired', 401);
    }

    // 4. Delete the challenge immediately (single-use constraint)
    await tx.mfaChallenge.delete({
      where: { id: challenge.id },
    });

    // 5. Fetch associated admin
    const admin = await tx.admin.findFirst({
      where: { id: challenge.adminId, deletedAt: null },
      include: { backupCodes: true },
    });

    if (!admin) {
      throw new AppError('Admin account not found', 401);
    }

    // Check account lockout status
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new AppError('Account is temporarily locked', 403);
    }

    // Check active status
    if (admin.status !== AdminStatus.ACTIVE) {
      throw new AppError('Admin account is inactive', 401);
    }

    let codeVerified = false;
    let isBackupCode = false;
    let matchedBackupId: string | null = null;

    const trimmedCode = data.code.trim();

    // Check if recovery code matches formatting (XXXX-XXXX-XXXX)
    const backupPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (backupPattern.test(trimmedCode)) {
      isBackupCode = true;
      const hashedInput = hashSHA256(trimmedCode);
      for (const bc of admin.backupCodes) {
        if (safeCompareHashes(bc.hashedCode, hashedInput)) {
          codeVerified = true;
          matchedBackupId = bc.id;
          break;
        }
      }
    } else if (/^\d{6}$/.test(trimmedCode)) {
      // Standard 6-digit TOTP
      if (!admin.twoFactorSecret || !admin.twoFactorIv || !admin.twoFactorTag) {
        throw new AppError('MFA is not set up on this account', 400);
      }
      const decryptedSecret = decrypt({
        encryptedSecret: admin.twoFactorSecret,
        iv: admin.twoFactorIv,
        authTag: admin.twoFactorTag,
      });
      codeVerified = otp.verifySync({ secret: decryptedSecret, token: trimmedCode, epochTolerance: OTP_EPOCH_TOLERANCE }).valid;
    }

    if (codeVerified) {
      if (isBackupCode && matchedBackupId) {
        // Delete backup code atomically
        await tx.backupCode.delete({
          where: { id: matchedBackupId },
        });
        await tx.auditLog.create({
          data: {
            event: AuditEvent.MFA_BACKUP_CODE_USED,
            actorName: admin.name,
            details: `Backup code successfully consumed.`,
            ipAddress,
            severity: AuditSeverity.INFO,
            adminId: admin.id,
          },
        });
      } else {
        await tx.auditLog.create({
          data: {
            event: AuditEvent.MFA_VERIFY_SUCCESS,
            actorName: admin.name,
            details: `MFA TOTP code successfully verified.`,
            ipAddress,
            severity: AuditSeverity.INFO,
            adminId: admin.id,
          },
        });
      }

      // Reset login parameters
      await tx.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        },
      });

      // Generate credentials
      const sessionId = crypto.randomUUID();
      const refreshToken = signRefreshToken({ sub: admin.id, sessionId });
      const accessToken = signAccessToken({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
        sessionId,
      });
      const hashedSessionToken = hashSHA256(refreshToken);

      // Session registration
      await tx.session.create({
        data: {
          id: sessionId,
          adminId: admin.id,
          hashedToken: hashedSessionToken,
          userAgent,
          ipAddress,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Successful login audit log
      await tx.auditLog.create({
        data: {
          event: AuditEvent.LOGIN,
          actorName: admin.name,
          details: `Admin logged in successfully with MFA from IP: ${ipAddress}`,
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
    } else {
      // MFA Failure
      const attempts = admin.failedLoginAttempts + 1;
      const updateData: Prisma.AdminUpdateInput = { failedLoginAttempts: attempts };
      let isLocked = false;

      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
        updateData.failedLoginAttempts = 0;
        isLocked = true;
      }

      await tx.admin.update({
        where: { id: admin.id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          event: isLocked ? AuditEvent.MFA_FAILURE_LOCKOUT : AuditEvent.MFA_VERIFY_FAILED,
          actorName: admin.name,
          details: isLocked
            ? `Admin account locked temporarily due to 5 failed MFA code entries. IP: ${ipAddress}`
            : `Failed MFA verification attempt from IP: ${ipAddress}`,
          ipAddress,
          severity: isLocked ? AuditSeverity.CRITICAL : AuditSeverity.WARNING,
          adminId: admin.id,
        },
      });

      throw new AppError('Invalid verification code', 401);
    }
  });
}

/**
 * Initiates TOTP setup. Generates a temporary secret key, registers it on the admin,
 * and creates a QR code payload.
 */
export async function setup2FA(adminId: string): Promise<{ qrCode: string; secret: string }> {
  const admin = await findAdminById(adminId);
  if (!admin) {
    throw new AppError('Admin account not found', 401);
  }

  if (admin.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is already enabled', 400);
  }

  const secret = otp.generateSecret();
  const encrypted = encrypt(secret);

  await updateAdmin(admin.id, {
    tempTwoFactorSecret: encrypted.encryptedSecret,
    tempTwoFactorIv: encrypted.iv,
    tempTwoFactorTag: encrypted.authTag,
  });

  const otpauth = otp.generateURI({ issuer: 'XIFOZ Security', label: admin.email, secret });
  const qrCode = await QRCode.toDataURL(otpauth);

  await prisma.auditLog.create({
    data: {
      event: AuditEvent.MFA_QR_GENERATED,
      actorName: admin.name,
      details: `MFA QR code and configuration key successfully generated.`,
      severity: AuditSeverity.INFO,
      adminId: admin.id,
    },
  });

  return {
    qrCode,
    secret,
  };
}

/**
 * Confirms setup code against temporary secret, activates 2FA, and returns generated backup codes.
 */
export async function verify2FA(adminId: string, code: string): Promise<string[]> {
  const admin = await findAdminById(adminId);
  if (!admin) {
    throw new AppError('Admin account not found', 401);
  }

  if (!admin.tempTwoFactorSecret || !admin.tempTwoFactorIv || !admin.tempTwoFactorTag) {
    throw new AppError('Two-factor authentication setup has not been initiated', 400);
  }

  const decryptedSecret = decrypt({
    encryptedSecret: admin.tempTwoFactorSecret,
    iv: admin.tempTwoFactorIv,
    authTag: admin.tempTwoFactorTag,
  });

  const isValid = otp.verifySync({ secret: decryptedSecret, token: code.trim(), epochTolerance: OTP_EPOCH_TOLERANCE }).valid;

  if (!isValid) {
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.MFA_VERIFY_FAILED,
        actorName: admin.name,
        details: `Two-factor activation attempt failed: invalid verification code.`,
        severity: AuditSeverity.WARNING,
        adminId: admin.id,
      },
    });
    throw new AppError('Invalid verification code', 400);
  }

  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map((bc) => hashSHA256(bc));

  // Enable 2FA, save secrets, and write backup codes inside transaction
  await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: admin.tempTwoFactorSecret,
        twoFactorIv: admin.tempTwoFactorIv,
        twoFactorTag: admin.tempTwoFactorTag,
        tempTwoFactorSecret: null,
        tempTwoFactorIv: null,
        tempTwoFactorTag: null,
      },
    });

    // Delete any old backup codes just in case, then save new ones
    await tx.backupCode.deleteMany({
      where: { adminId: admin.id },
    });

    await tx.backupCode.createMany({
      data: hashedBackupCodes.map((hashedCode) => ({
        adminId: admin.id,
        hashedCode,
      })),
    });

    await tx.auditLog.create({
      data: {
        event: AuditEvent.MFA_ENABLED,
        actorName: admin.name,
        details: `Two-factor authentication successfully enabled. Backup codes created.`,
        severity: AuditSeverity.INFO,
        adminId: admin.id,
      },
    });
  });

  return backupCodes;
}

/**
 * Disables 2FA on the admin's account. Requires a valid code to verify authorization.
 */
export async function disable2FA(adminId: string, code: string): Promise<void> {
  const admin = await prisma.admin.findFirst({
    where: { id: adminId, deletedAt: null, status: AdminStatus.ACTIVE },
    include: { backupCodes: true },
  });

  if (!admin) {
    throw new AppError('Admin account not found', 401);
  }

  if (!admin.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not active', 400);
  }

  let codeVerified = false;
  const trimmedCode = code.trim();

  // Accept backup code
  const backupPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (backupPattern.test(trimmedCode)) {
    const hashedInput = hashSHA256(trimmedCode);
    for (const bc of admin.backupCodes) {
      if (safeCompareHashes(bc.hashedCode, hashedInput)) {
        codeVerified = true;
        break;
      }
    }
  } else if (/^\d{6}$/.test(trimmedCode)) {
    if (!admin.twoFactorSecret || !admin.twoFactorIv || !admin.twoFactorTag) {
      throw new AppError('MFA missing secrets', 500);
    }
    const decryptedSecret = decrypt({
      encryptedSecret: admin.twoFactorSecret,
      iv: admin.twoFactorIv,
      authTag: admin.twoFactorTag,
    });
    codeVerified = otp.verifySync({ secret: decryptedSecret, token: trimmedCode, epochTolerance: OTP_EPOCH_TOLERANCE }).valid;
  }

  if (!codeVerified) {
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.MFA_VERIFY_FAILED,
        actorName: admin.name,
        details: `Failed attempt to disable 2FA: invalid verification code.`,
        severity: AuditSeverity.WARNING,
        adminId: admin.id,
      },
    });
    throw new AppError('Invalid verification code', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id: admin.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorIv: null,
        twoFactorTag: null,
        tempTwoFactorSecret: null,
        tempTwoFactorIv: null,
        tempTwoFactorTag: null,
      },
    });

    await tx.backupCode.deleteMany({
      where: { adminId: admin.id },
    });

    await tx.auditLog.create({
      data: {
        event: AuditEvent.MFA_DISABLED,
        actorName: admin.name,
        details: `Two-factor authentication disabled. Backup codes deleted.`,
        severity: AuditSeverity.INFO,
        adminId: admin.id,
      },
    });
  });
}

/**
 * Regenerates the 10 backup codes for an active admin.
 */
export async function regenerateBackupCodes(adminId: string, code: string): Promise<string[]> {
  const admin = await findAdminById(adminId);
  if (!admin) {
    throw new AppError('Admin account not found', 401);
  }

  if (!admin.twoFactorEnabled) {
    throw new AppError('Two-factor authentication is not active', 400);
  }

  if (!admin.twoFactorSecret || !admin.twoFactorIv || !admin.twoFactorTag) {
    throw new AppError('MFA missing secrets', 500);
  }

  const decryptedSecret = decrypt({
    encryptedSecret: admin.twoFactorSecret,
    iv: admin.twoFactorIv,
    authTag: admin.twoFactorTag,
  });

  const isValid = otp.verifySync({ secret: decryptedSecret, token: code.trim(), epochTolerance: OTP_EPOCH_TOLERANCE }).valid;

  if (!isValid) {
    await prisma.auditLog.create({
      data: {
        event: AuditEvent.MFA_VERIFY_FAILED,
        actorName: admin.name,
        details: `Failed backup code regeneration: invalid verification code.`,
        severity: AuditSeverity.WARNING,
        adminId: admin.id,
      },
    });
    throw new AppError('Invalid verification code', 400);
  }

  const backupCodes = generateBackupCodes();
  const hashedBackupCodes = backupCodes.map((bc) => hashSHA256(bc));

  await prisma.$transaction(async (tx) => {
    // Delete all old backup codes
    await tx.backupCode.deleteMany({
      where: { adminId: admin.id },
    });

    // Create new backup codes
    await tx.backupCode.createMany({
      data: hashedBackupCodes.map((hashedCode) => ({
        adminId: admin.id,
        hashedCode,
      })),
    });

    await tx.auditLog.create({
      data: {
        event: AuditEvent.MFA_BACKUP_REGENERATED,
        actorName: admin.name,
        details: `Backup codes regenerated successfully. Old recovery codes invalidated.`,
        severity: AuditSeverity.INFO,
        adminId: admin.id,
      },
    });
  });

  return backupCodes;
}

/**
 * Returns the current status of 2FA for the admin.
 */
export async function getStatus2FA(adminId: string): Promise<{ enabled: boolean; backupCodesCount: number }> {
  const admin = await prisma.admin.findFirst({
    where: { id: adminId, deletedAt: null },
    include: { backupCodes: true },
  });

  if (!admin) {
    throw new AppError('Admin account not found', 401);
  }

  return {
    enabled: admin.twoFactorEnabled,
    backupCodesCount: admin.backupCodes.length,
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
    logger.warn(`Expired session verification attempted. Session ID: ${session.id}`, {
      adminId: session.adminId,
      ipAddress,
    });
    throw new AppError('Session expired', 401);
  }

  // Admin active state check
  if (session.admin.status !== AdminStatus.ACTIVE || session.admin.deletedAt !== null) {
    throw new AppError('Admin account is inactive', 401);
  }

  // Refresh Token Rotation: revoke the previous session and create a new session atomically
  const newSessionId = crypto.randomUUID();
  const newRefreshToken = signRefreshToken({ sub: session.adminId, sessionId: newSessionId });
  const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  await prisma.$transaction(async (tx) => {
    // Revoke old session
    await tx.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // Create new session
    await tx.session.create({
      data: {
        id: newSessionId,
        adminId: session.adminId,
        hashedToken: newHashedToken,
        userAgent: session.userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  });

  const newAccessToken = signAccessToken({
    sub: session.admin.id,
    email: session.admin.email,
    role: session.admin.role,
    sessionId: newSessionId,
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
  lastLoginAt: Date | null;
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
    lastLoginAt: admin.lastLoginAt,
  };
}
