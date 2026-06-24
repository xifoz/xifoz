interface TelegramLeadPayload {
  submissionId: string;
  submittedAt: Date;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
}

function buildTelegramMessage(payload: TelegramLeadPayload): string {
  const { submissionId, submittedAt, name, email, phone, company, service, message } = payload;

  return [
    '🚨 NEW XIFOZ LEAD',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone ?? 'Not provided'}`,
    `Company: ${company ?? 'Not provided'}`,
    `Service: ${service ?? 'Not provided'}`,
    '',
    'Message:',
    message,
    '',
    'Submission ID:',
    submissionId,
    '',
    'Time:',
    submittedAt.toUTCString(),
  ].join('\n');
}

export async function sendTelegramLeadNotification(
  payload: TelegramLeadPayload
): Promise<void> {
  const botToken = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];

  if (!botToken || !chatId) {
    throw new Error(
      'Missing required environment variables: TELEGRAM_BOT_TOKEN and/or TELEGRAM_CHAT_ID'
    );
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const body = JSON.stringify({
    chat_id: chatId,
    text: buildTelegramMessage(payload),
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Telegram API error ${response.status}: ${errorText}`
    );
  }
}
