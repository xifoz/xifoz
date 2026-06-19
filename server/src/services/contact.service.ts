import { createContactSubmission } from './contact.repository.js';
import type { ContactInput } from '../validators/contact.validator.js';
import { logger } from '../utils/logger.js';

export async function submitContactForm(data: ContactInput) {
  const submission = await createContactSubmission(data);
  logger.info('Contact form submission received', {
    id: submission.id,
    email: data.email,
    company: data.company,
    service: data.service,
  });
  return submission;
}
