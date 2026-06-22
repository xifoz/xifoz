import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JWT_ALGORITHM, JWT_ISSUER, JWT_AUDIENCE } from './auth.constants.js';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/index.js';

/**
 * Signs a short-lived access token.
 * @param payload Payload containing sub, email, and role.
 * @returns The signed JWT string.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: config.jwt.accessExpiresIn as any,
  });
}

/**
 * Signs a long-lived refresh token.
 * @param payload Payload containing sub and sessionId.
 * @returns The signed JWT string.
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    algorithm: JWT_ALGORITHM,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

/**
 * Verifies and decodes an access token.
 * @param token The access token JWT string.
 * @returns The decoded AccessTokenPayload.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as AccessTokenPayload;
}

/**
 * Verifies and decodes a refresh token.
 * @param token The refresh token JWT string.
 * @returns The decoded RefreshTokenPayload.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret, {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as RefreshTokenPayload;
}
