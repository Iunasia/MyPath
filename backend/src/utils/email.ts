import nodemailer from 'nodemailer';

// ── SMTP configuration (falls back to Gmail defaults) ───────────────────────
const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587', 10);
const SMTP_USER = process.env.SMTP_USER ?? '';
const SMTP_PASS = process.env.SMTP_PASS ?? '';
const FROM_ADDRESS = process.env.EMAIL_FROM ?? `Phlov Team <${SMTP_USER}>`;

const smtpConfigured = !!(SMTP_USER && SMTP_PASS);

if (!smtpConfigured) {
  console.warn(
    '⚠️  SMTP_USER or SMTP_PASS is not set. ' +
    'Running in DEV mode — verification codes will be logged to the console.'
  );
}

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// ── Send (or log) the 6-digit verification code & magic link ────────────────
export const sendVerificationEmail = async (to: string, code: string, uuidToken?: string, locale: string = 'en'): Promise<void> => {
  const verifyLink = `${process.env.FRONTEND_URL}/auth/verify?email=${encodeURIComponent(to)}&code=${uuidToken}`;

  if (!transporter) {
    // DEV fallback — print the code so you can verify without a real SMTP server
    console.log('\n========================================');
    console.log(`📧 [DEV] Verification email for: ${to}`);
    console.log(`🔑 Code: ${code}`);
    console.log(`🔗 Magic Link: ${verifyLink}`);
    console.log('========================================\n');
    return;
  }

  const isKm = locale === 'km';
  const subject = isKm ? 'ផ្ទៀងផ្ទាត់អាសយដ្ឋានអ៊ីមែលរបស់អ្នក' : 'Verify Your Email Address';
  const welcome = isKm ? 'សូមស្វាគមន៍មកកាន់ Phlov!' : 'Welcome to Phlov!';
  const verifyInst = isKm ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នកភ្លាមៗ ហើយចូលប្រើគណនី៖' : 'Click the button below to instantly verify your email and log in:';
  const verifyBtn = isKm ? 'ផ្ទៀងផ្ទាត់អ៊ីមែលដោយស្វ័យប្រវត្តិ' : 'Verify Email Automatically';
  const manualInst = isKm ? 'ឬបញ្ចូលលេខកូដ ៦ ខ្ទង់នេះនៅលើគេហទំព័រដោយផ្ទាល់៖' : 'Or manually enter this 6-digit code on the website:';
  const expireInst = isKm ? 'លេខកូដ និងតំណនេះនឹងផុតកំណត់ក្នុងរយៈពេល ១៥ នាទី។' : 'This code and link will expire in 15 minutes.';
  const cancelInst = isKm ? 'ប្រសិនបើអ្នកមិនបានស្នើសុំនេះទេ សូមព្រងើយកន្តើយនឹងអ៊ីមែលនេះ។' : 'If you did not request this, please ignore this email.';

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: subject,
    html: `
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
    `,
  });
  console.log(`✅ Verification email successfully sent to ${to} in locale: ${locale}`);
};