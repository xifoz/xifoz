import rateLimit from 'express-rate-limit';
import type { ApiResponse } from '../types/index.js';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: (): ApiResponse => ({
    success: false,
    message: 'Too many requests. Please try again later.',
  }),
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
});
