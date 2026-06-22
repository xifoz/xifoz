import type { Response, CookieOptions } from 'express';
import { config } from '../config/index.js';

/**
 * Returns cookie options based on the active environment configuration.
 */
export function getRefreshTokenCookieOptions(): CookieOptions {
  const isProd = config.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: config.cookie.sameSite,
    path: config.cookie.path,
    maxAge: config.cookie.maxAge,
  };
}

/**
 * Sets the refresh token cookie on the given Express Response.
 * @param res The Express Response object.
 * @param token The signed refresh token.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(config.cookie.name, token, getRefreshTokenCookieOptions());
}

/**
 * Clears the refresh token cookie from the given Express Response.
 * @param res The Express Response object.
 */
export function clearRefreshTokenCookie(res: Response): void {
  const options = getRefreshTokenCookieOptions();
  // Clear cookie immediately by setting Max-Age to 0 and setting an expired Date
  res.cookie(config.cookie.name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}
