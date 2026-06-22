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

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
