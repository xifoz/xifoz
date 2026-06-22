import type { Request, Response, NextFunction } from 'express';
import { loginRequestSchema } from '../validators/auth.validator.js';
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

    const { accessToken, refreshToken, user } = await authService.login(
      parsed.data,
      req.ip || null,
      req.headers['user-agent'] || null
    );

    setRefreshTokenCookie(res, refreshToken);

    const response: ApiResponse<{ accessToken: string; user: typeof user }> = {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user,
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
