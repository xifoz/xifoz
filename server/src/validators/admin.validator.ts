import { z } from 'zod';

export const updateSettingsSchema = z.object({
  portalTitle: z
    .string({ required_error: 'Portal title is required' })
    .min(1, 'Portal title cannot be empty')
    .max(100, 'Portal title must be at most 100 characters')
    .trim(),
  sessionTimeout: z
    .number({ required_error: 'Session timeout is required' })
    .int('Session timeout must be an integer')
    .min(1, 'Session timeout must be at least 1 day')
    .max(30, 'Session timeout must be at most 30 days'),
  rateLimit: z
    .number({ required_error: 'Rate limit is required' })
    .int('Rate limit must be an integer')
    .min(10, 'Rate limit must be at least 10 requests per hour')
    .max(1000, 'Rate limit must be at most 1000 requests per hour'),
  notificationsEnabled: z
    .boolean({ required_error: 'Notification preference is required' }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
