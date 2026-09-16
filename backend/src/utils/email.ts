import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your personal gmail
    pass: process.env.EMAIL_PASS, // the 16-character app password
  },
});

export const sendVerificationEmail = async (to: string, code: string): Promise<void> => {
  const mailOptions = {
    from: `"Phlov Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Phlov!</h2>
        <p>Please use the following 6-digit code to verify your email address:</p>
        <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; background: #F3F4F6; padding: 10px; text-align: center; border-radius: 8px;">
          ${code}
        </h1>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};