import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be under 100 characters'),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});

export const logoutRequestSchema = z.object({});

/**
 * Validates a single TOTP or backup code supplied for 2FA management operations
 * (verify, disable, regenerate-backup-codes).
 */
export const twoFactorCodeSchema = z.object({
  code: z
    .string({ required_error: 'Verification code is required' })
    .trim()
    .min(6, 'Verification code must be at least 6 characters')
    .max(19, 'Verification code must be at most 19 characters'),
});

/**
 * Validates the body for the public 2FA login-verification endpoint.
 * Requires both the challenge token issued at credential-login and the TOTP/backup code.
 */
export const twoFactorLoginSchema = z.object({
  challengeToken: z
    .string({ required_error: 'Challenge token is required' })
    .trim()
    .min(1, 'Challenge token is required'),
  code: z
    .string({ required_error: 'Verification code is required' })
    .trim()
    .min(6, 'Verification code must be at least 6 characters')
    .max(19, 'Verification code must be at most 19 characters'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
export type TwoFactorCodeRequest = z.infer<typeof twoFactorCodeSchema>;
export type TwoFactorLoginRequest = z.infer<typeof twoFactorLoginSchema>;
