import { createContactSubmission } from './contact.repository.js';
import { sendContactNotificationEmail } from './email.service.js';
import type { ContactInput } from '../validators/contact.validator.js';
import { logger } from '../utils/logger.js';

export async function submitContactForm(data: ContactInput) {
  // 1. Persist submission — primary operation
  const submission = await createContactSubmission(data);

  // 2. Send email notification — secondary operation (never blocks success response)
  try {
    await sendContactNotificationEmail({
      submissionId: submission.id,
      submittedAt: submission.createdAt,
      name: data.name,
      email: data.email,
      company: data.company,
      service: data.service,
      message: data.message,
    });
    logger.info('Lead notification email sent', {
      submissionId: submission.id,
      email: data.email,
      company: data.company,
    });
  } catch (err) {
    logger.error('Lead notification email failed', {
      submissionId: submission.id,
      email: data.email,
      company: data.company,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 3. Return submission regardless of email outcome
  return submission;
}
