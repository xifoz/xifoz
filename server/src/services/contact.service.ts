import { createContactSubmission } from './contact.repository.js';
import { sendContactNotificationEmail } from './email.service.js';
import { sendTelegramLeadNotification } from './telegram.service.js';
import type { ContactInput } from '../validators/contact.validator.js';
import { logger } from '../utils/logger.js';

export async function submitContactForm(data: ContactInput) {
  // 1. Persist submission — primary operation
  const submission = await createContactSubmission(data);

  const notificationPayload = {
    submissionId: submission.id,
    submittedAt: submission.createdAt,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    service: data.service,
    message: data.message,
  };

  // 2. Send email notification in the background
  void sendContactNotificationEmail(notificationPayload)
    .then(() => {
      logger.info('Lead notification email sent', {
        submissionId: submission.id,
        email: data.email,
        company: data.company,
      });
    })
    .catch((err) => {
      logger.error('Lead notification email failed', {
        submissionId: submission.id,
        email: data.email,
        company: data.company,
        error: err instanceof Error ? err.message : String(err),
      });
    });

  // 3. Send Telegram notification in the background
  void sendTelegramLeadNotification(notificationPayload)
    .then(() => {
      logger.info('Telegram notification sent', {
        submissionId: submission.id,
        email: data.email,
      });
    })
    .catch((err) => {
      logger.error('Telegram notification failed', {
        submissionId: submission.id,
        email: data.email,
        error: err instanceof Error ? err.message : String(err),
      });
    });

  // 4. Return immediately after saving the submission
  return submission;
}