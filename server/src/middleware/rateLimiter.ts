import rateLimit, { Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';
import type { ApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

let rateLimitStore: Store | undefined;

if (process.env['REDIS_URL']) {
  try {
    const client = new Redis(process.env['REDIS_URL']);
    rateLimitStore = new RedisStore({
      // @ts-expect-error - sendCommand expects string args
      sendCommand: (...args: string[]) => client.call(args[0], ...args.slice(1)),
    });
    logger.info('Distributed Redis rate limit store initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize Redis rate limit store, falling back to memory', err);
  }
}

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many requests. Please try again later.',
  }),
  skip: () => process.env.NODE_ENV === 'test',
  store: rateLimitStore,
});

export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many form submissions. Please wait before trying again.',
  }),
  skipSuccessfulRequests: false,
  skip: () => process.env.NODE_ENV === 'test',
  store: rateLimitStore,
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  }),
  skip: () => process.env.NODE_ENV === 'test',
  store: rateLimitStore,
});

/**
 * Stricter limiter for TOTP-based 2FA login attempts.
 * 10 attempts per 15 minutes per IP.
 */
export const totpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.',
  }),
  skip: () => process.env.NODE_ENV === 'test',
  store: rateLimitStore,
});

/**
 * Tight limiter for backup-code-based 2FA login attempts.
 * 5 attempts per hour per IP (backup codes are one-time use, high-value targets).
 */
export const backupCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many backup code attempts. Please try again after 1 hour.',
  }),
  skip: () => process.env.NODE_ENV === 'test',
  store: rateLimitStore,
});
