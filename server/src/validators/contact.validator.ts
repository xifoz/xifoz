import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .max(254, 'Email must be under 254 characters')
    .toLowerCase()
    .trim(),
  company: z
    .string()
    .max(150, 'Company name must be under 150 characters')
    .trim()
    .optional(),
  service: z
    .string()
    .max(100, 'Service must be under 100 characters')
    .trim()
    .optional(),
  message: z
    .string({ required_error: 'Message is required' })
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be under 2000 characters')
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;
