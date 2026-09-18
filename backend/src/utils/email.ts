// ── Email delivery via HTTP API ───────────────────────────────────────────────
// Primary:  Brevo       (300 free emails/day)  — https://app.brevo.com
// Fallback: MailerSend  (3,000 free/month)     — https://app.mailersend.com
//
// Uses Node's built-in fetch — no nodemailer, no SMTP, no blocked ports.
// Set BREVO_API_KEY and/or MAILERSEND_API_KEY in .env to enable live sending.
// If neither key is set the code falls back to console.log (DEV mode).

const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'Domner Team <noreply@domner.app>';

// Extract plain "Name <addr>" → { name, email } for provider payloads
const parseFrom = (from: string) => {
  const match = from.match(/^(.+?)\s*<(.+?)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: 'Domner Team', email: from.trim() };
};

// ── Provider: Brevo ──────────────────────────────────────────────────────────
const sendViaBrevo = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set');

  const sender = parseFrom(FROM_ADDRESS);

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(10_000), // 10 s hard timeout
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo HTTP ${res.status}: ${body}`);
  }
};

// ── Provider: MailerSend ─────────────────────────────────────────────────────
const sendViaMailerSend = async (
  to: string,
  subject: string,
  html: string,
): Promise<void> => {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) throw new Error('MAILERSEND_API_KEY not set');

  const sender = parseFrom(FROM_ADDRESS);

  const res = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: sender.email, name: sender.name },
      to: [{ email: to }],
      subject,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`MailerSend HTTP ${res.status}: ${body}`);
  }
};

// ── Public API — same signature as before ────────────────────────────────────
export const sendVerificationEmail = async (
  to: string,
  code: string,
  uuidToken?: string,
  locale: string = 'en',
): Promise<void> => {
  const verifyLink = `${process.env.FRONTEND_URL}/auth/verify?email=${encodeURIComponent(to)}&code=${uuidToken}`;

  // ── DEV fallback ─────────────────────────────────────────────────────────
  const hasBrevo = !!process.env.BREVO_API_KEY;
  const hasMailerSend = !!process.env.MAILERSEND_API_KEY;

  if (!hasBrevo && !hasMailerSend) {
    console.warn(
      '⚠️  Neither BREVO_API_KEY nor MAILERSEND_API_KEY is set. ' +
      'Running in DEV mode — verification codes will be logged to the console.',
    );
    console.log('\n========================================');
    console.log(`📧 [DEV] Verification email for: ${to}`);
    console.log(`🔑 Code: ${code}`);
    console.log(`🔗 Magic Link: ${verifyLink}`);
    console.log('========================================\n');
    return;
  }

  // ── Build bilingual HTML (identical to old template) ─────────────────────
  const isKm = locale === 'km';
  const subject = isKm ? 'ផ្ទៀងផ្ទាត់អាសយដ្ឋានអ៊ីមែលរបស់អ្នក' : 'Verify Your Email Address';
  const welcome = isKm ? 'សូមស្វាគមន៍មកកាន់ Domner!' : 'Welcome to Domner!';
  const verifyInst = isKm
    ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នកភ្លាមៗ ហើយចូលប្រើគណនី៖'
    : 'Click the button below to instantly verify your email and log in:';
  const verifyBtn = isKm ? 'ផ្ទៀងផ្ទាត់អ៊ីមែលដោយស្វ័យប្រវត្តិ' : 'Verify Email Automatically';
  const manualInst = isKm
    ? 'ឬបញ្ចូលលេខកូដ ៦ ខ្ទង់នេះនៅលើគេហទំព័រដោយផ្ទាល់៖'
    : 'Or manually enter this 6-digit code on the website:';
  const expireInst = isKm
    ? 'លេខកូដ និងតំណនេះនឹងផុតកំណត់ក្នុងរយៈពេល ១៥ នាទី។'
    : 'This code and link will expire in 15 minutes.';
  const cancelInst = isKm
    ? 'ប្រសិនបើអ្នកមិនបានស្នើសុំនេះទេ សូមព្រងើយកន្តើយនឹងអ៊ីមែលនេះ។'
    : 'If you did not request this, please ignore this email.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h2>${welcome}</h2>

      <p>${verifyInst}</p>
      <div style="margin: 30px 0;">
        <a href="${verifyLink}" style="display:inline-block; padding:14px 28px; background-color:#4F46E5; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
          ${verifyBtn}
        </a>
      </div>

      <p style="color: #666; margin-top: 20px;">${manualInst}</p>
      <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px; border-radius: 8px;">
        ${code}
      </h1>

      <p style="font-size: 12px; color: #999; margin-top: 30px;">${expireInst}</p>
      <p style="font-size: 12px; color: #999; margin-top: 5px;">${cancelInst}</p>
    </div>
  `;

  await deliver(to, subject, html, `Verification email (locale: ${locale})`);
};

// ── Shared delivery: Brevo first, then MailerSend ────────────────────────────
const deliver = async (to: string, subject: string, html: string, label: string): Promise<void> => {
  if (process.env.BREVO_API_KEY) {
    try {
      await sendViaBrevo(to, subject, html);
      console.log(`✅ [Brevo] ${label} sent to ${to}`);
      return;
    } catch (err) {
      console.warn(`⚠️  Brevo failed — falling back to MailerSend. Reason: ${(err as Error).message}`);
    }
  }

  if (process.env.MAILERSEND_API_KEY) {
    await sendViaMailerSend(to, subject, html);
    console.log(`✅ [MailerSend] ${label} sent to ${to}`);
    return;
  }

  // Both providers were configured but both failed (only Brevo was set and threw)
  throw new Error('All email providers failed. Check your API keys and domain verification.');
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Tells a student their verification request has been answered.
 *
 * Deliberately says only *that* there is an answer, not what it is: a verdict
 * like "scam" sitting in an inbox without the reviewer's explanation beside it
 * is easy to misread or forward out of context. The in-app inbox holds the
 * full answer. Bilingual because accounts do not record a language.
 */
export const sendVerdictEmail = async (to: string, name: string, requestTitle: string): Promise<void> => {
  if (process.env.NODE_ENV === 'test') return;
  const inboxLink = `${process.env.FRONTEND_URL}/verify`;

  if (!process.env.BREVO_API_KEY && !process.env.MAILERSEND_API_KEY) {
    console.log(`📧 [DEV] Verdict email for ${to}: "${requestTitle}" has an answer → ${inboxLink}`);
    return;
  }

  const subject = 'Your scholarship check has an answer · ការត្រួតពិនិត្យអាហារូបករណ៍របស់អ្នកមានចម្លើយហើយ';
  const title = escapeHtml(requestTitle);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h2>Hi ${escapeHtml(name)},</h2>
      <p>Our team has finished checking what you sent us:</p>
      <p style="font-weight: bold; background: #F3F4F6; padding: 12px; border-radius: 8px;">${title}</p>
      <p>សួស្តី! ក្រុមការងាររបស់យើងបានពិនិត្យរួចរាល់នូវអ្វីដែលអ្នកបានផ្ញើមក។</p>
      <div style="margin: 30px 0;">
        <a href="${inboxLink}" style="display:inline-block; padding:14px 28px; background-color:#4F46E5; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
          See the answer · មើលចម្លើយ
        </a>
      </div>
      <p style="font-size: 12px; color: #999;">
        You are receiving this because you asked Domner to check a scholarship.<br/>
        អ្នកទទួលបានអ៊ីមែលនេះ ព្រោះអ្នកបានស្នើឱ្យ Domner ពិនិត្យអាហារូបករណ៍មួយ។
      </p>
    </div>
  `;

  await deliver(to, subject, html, 'Verdict email');
};