import { Resend } from 'resend';

interface ContactNotificationPayload {
  submissionId: string;
  submittedAt: Date;
  name: string;
  email: string;
  company?: string | null;
  service?: string | null;
  message: string;
}

function buildEmailHtml(payload: ContactNotificationPayload): string {
  const { submissionId, submittedAt, name, email, company, service, message } = payload;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#374151;width:140px;vertical-align:top;white-space:nowrap;">${label}</td>
      <td style="padding:8px 12px;color:#111827;word-break:break-word;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>New Contact Form Submission — XIFOZ</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">XIFOZ</p>
              <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">Internal Lead Notification</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0;font-size:18px;font-weight:600;color:#111827;">New Contact Form Submission</p>
              <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">A visitor submitted the contact form. Review the details below.</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:16px 32px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>

          <!-- Submission Details Table -->
          <tr>
            <td style="padding:16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
                <tbody>
                  ${row('Submission ID', submissionId)}
                  ${row('Timestamp', submittedAt.toUTCString())}
                  ${row('Name', name)}
                  ${row('Email', `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>`)}
                  ${row('Company', company ?? '<span style="color:#9ca3af;font-style:italic;">Not provided</span>')}
                  ${row('Service', service ?? '<span style="color:#9ca3af;font-style:italic;">Not provided</span>')}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Message Block -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.6px;">Message</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:3px solid #0f172a;border-radius:4px;padding:16px;font-size:14px;color:#1f2937;line-height:1.7;white-space:pre-wrap;word-break:break-word;">${message}</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification from the XIFOZ contact system. Do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText(payload: ContactNotificationPayload): string {
  const { submissionId, submittedAt, name, email, company, service, message } = payload;
  return [
    '[XIFOZ] New Contact Form Submission',
    '=====================================',
    `Submission ID : ${submissionId}`,
    `Timestamp     : ${submittedAt.toUTCString()}`,
    `Name          : ${name}`,
    `Email         : ${email}`,
    `Company       : ${company ?? 'Not provided'}`,
    `Service       : ${service ?? 'Not provided'}`,
    '',
    'Message:',
    '--------',
    message,
    '',
    '--- Automated notification from XIFOZ contact system ---',
  ].join('\n');
}

export async function sendContactNotificationEmail(
  payload: ContactNotificationPayload
): Promise<void> {
  const apiKey = process.env['RESEND_API_KEY'];
  const supportEmail = process.env['SUPPORT_EMAIL'];

  if (!apiKey) {
    throw new Error('Missing required environment variable: RESEND_API_KEY');
  }
  if (!supportEmail) {
    throw new Error('Missing required environment variable: SUPPORT_EMAIL');
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: 'XIFOZ Notifications <notifications@xifoz.com>',
    to: [supportEmail],
    subject: '[XIFOZ] New Contact Form Submission',
    html: buildEmailHtml(payload),
    text: buildEmailText(payload),
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}
