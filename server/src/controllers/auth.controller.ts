import type { Request, Response, NextFunction } from 'express';
import {
  loginRequestSchema,
  twoFactorCodeSchema,
  twoFactorLoginSchema,
} from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Handles credentials-based admin login.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      throw new AppError('Validation failed. Please correct the errors and try again.', 422, errors);
    }

    const result = await authService.login(
      parsed.data,
      req.ip || null,
      req.headers['user-agent'] || null
    );

    if (result.mfaRequired) {
      const response: ApiResponse<{ mfaRequired: true; challengeToken: string }> = {
        success: true,
        message: 'MFA verification required',
        data: {
          mfaRequired: true,
          challengeToken: result.challengeToken,
        },
      };
      res.status(200).json(response);
      return;
    }

    setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiResponse<{ accessToken: string; user: typeof result.user }> = {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Rotates the refresh token (using cookie token verification) and issues a new access token.
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cookieToken = req.cookies[config.cookie.name];
    if (!cookieToken) {
      throw new AppError('Refresh token is required', 401, { auth: ['token_required'] });
    }

    const { accessToken, refreshToken, user } = await authService.refresh(
      cookieToken,
      req.ip || null,
      req.headers['user-agent'] || null
    );

    setRefreshTokenCookie(res, refreshToken);

    const response: ApiResponse<{ accessToken: string; user: typeof user }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        user,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    // If the refresh token is invalid or expired, clear the cookie
    clearRefreshTokenCookie(res);
    next(err);
  }
}

/**
 * Revokes the current session and clears the refresh token cookie.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    await authService.logout(req.user.sessionId, req.user.adminId, req.ip || null);

    clearRefreshTokenCookie(res);

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Returns user profile info for the currently authenticated admin.
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await authService.me(req.user.adminId);

    const response: ApiResponse<{ user: typeof user }> = {
      success: true,
      message: 'User retrieved successfully',
      data: {
        user,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Initiates TOTP setup for the authenticated admin.
 * Returns a QR code (data URL) and the plain-text secret for manual entry.
 */
export async function setup2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const result = await authService.setup2FA(req.user.adminId);

    const response: ApiResponse<{ qrCode: string; secret: string }> = {
      success: true,
      message: '2FA setup initiated. Scan the QR code with your authenticator app.',
      data: result,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Verifies the TOTP code against the temporary secret and activates 2FA.
 * Returns the one-time backup codes on success.
 */
export async function verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const parsed = twoFactorCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      throw new AppError('Validation failed. Please correct the errors and try again.', 422, errors);
    }

    const backupCodes = await authService.verify2FA(req.user.adminId, parsed.data.code);

    const response: ApiResponse<{ backupCodes: string[] }> = {
      success: true,
      message: 'Two-factor authentication enabled successfully. Store your backup codes safely.',
      data: { backupCodes },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Disables 2FA on the authenticated admin's account after verifying a TOTP or backup code.
 */
export async function disable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const parsed = twoFactorCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      throw new AppError('Validation failed. Please correct the errors and try again.', 422, errors);
    }

    await authService.disable2FA(req.user.adminId, parsed.data.code);

    const response: ApiResponse = {
      success: true,
      message: 'Two-factor authentication disabled successfully.',
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Returns the current 2FA status (enabled flag + remaining backup code count) for the authenticated admin.
 */
export async function getStatus2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const status = await authService.getStatus2FA(req.user.adminId);

    const response: ApiResponse<{ enabled: boolean; backupCodesCount: number }> = {
      success: true,
      message: '2FA status retrieved successfully.',
      data: status,
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Regenerates 10 fresh backup codes for the authenticated admin after verifying a valid TOTP.
 */
export async function regenerateBackupCodes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const parsed = twoFactorCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      throw new AppError('Validation failed. Please correct the errors and try again.', 422, errors);
    }

    const backupCodes = await authService.regenerateBackupCodes(req.user.adminId, parsed.data.code);

    const response: ApiResponse<{ backupCodes: string[] }> = {
      success: true,
      message: 'Backup codes regenerated successfully. Store them safely; old codes are now invalid.',
      data: { backupCodes },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

/**
 * Completes MFA login: validates the challenge token + TOTP/backup code and issues session tokens.
 * This is a public endpoint — no Bearer token required.
 */
export async function loginVerify2FA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = twoFactorLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      throw new AppError('Validation failed. Please correct the errors and try again.', 422, errors);
    }

    const result = await authService.loginVerify2FA(
      parsed.data,
      req.ip || null,
      req.headers['user-agent'] || null
    );

    setRefreshTokenCookie(res, result.refreshToken);

    const response: ApiResponse<{ accessToken: string; user: typeof result.user }> = {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
