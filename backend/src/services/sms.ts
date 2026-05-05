import config from '../config';

export async function sendSms(phone: string, message: string): Promise<void> {
  if (config.NODE_ENV !== 'production') {
    console.log(`[SMS DEV] → ${phone}: ${message}`);
    return;
  }

  // Akedly — https://akedly.io/
  // Fill AKEDLY_API_KEY + AKEDLY_SENDER in .env once you get credentials from dashboard
  const res = await fetch(config.AKEDLY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.AKEDLY_API_KEY}`,
    },
    body: JSON.stringify({
      to:      phone,
      message: message,
      sender:  config.AKEDLY_SENDER,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Akedly SMS failed: ${res.status} — ${body}`);
  }
}
