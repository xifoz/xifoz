import type { Request, Response, NextFunction } from 'express';
import { contactSchema } from '../validators/contact.validator.js';
import { submitContactForm } from '../services/contact.service.js';
import type { ApiResponse } from '../types/index.js';

export async function handleContactSubmission(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = contactSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'general');
        if (!errors[key]) errors[key] = [];
        errors[key]!.push(issue.message);
      }
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed. Please correct the errors and try again.',
        errors,
      };
      res.status(422).json(response);
      return;
    }

    await submitContactForm(parsed.data);

    const response: ApiResponse = {
      success: true,
      message: 'Thank you for reaching out. We will be in touch within 24 hours.',
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
