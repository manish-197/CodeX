import nodemailer from 'nodemailer';

/**
 * Send Password Reset Email
 * Reads SMTP credentials from process.env, with graceful fallback for local development.
 */
export async function sendPasswordResetEmail({ toEmail, resetToken, userName = 'Citizen' }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'ArogyaRakshak AI Support <no-reply@arogyarakshak.org>';

  const resetUrl = `http://localhost:5173/?resetToken=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  console.log(`\n======================================================`);
  console.log(`[PASSWORD RESET SERVICE] Request for: ${toEmail}`);
  console.log(`[PASSWORD RESET SERVICE] Reset Token: ${resetToken}`);
  console.log(`[PASSWORD RESET SERVICE] Reset URL: ${resetUrl}`);
  console.log(`======================================================\n`);

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: 'ArogyaRakshak AI — Password Reset Verification Code',
        text: `Namaskar ${userName},\n\nYou requested to reset your password for ArogyaRakshak AI.\n\nYour Single-Use Reset Code: ${resetToken}\nDirect Reset Link: ${resetUrl}\n\nThis token will expire in 20 minutes. If you did not request this, please ignore this email.\n\nWarm regards,\nArogyaRakshak AI Healthcare Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563A6; margin: 0;">ArogyaRakshak AI</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Rural Healthcare Accessibility Platform</p>
            </div>
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #cbd5e1;">
              <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Namaskar <strong>${userName}</strong>,</p>
              <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                A password reset request was received for your ArogyaRakshak account. Use the single-use verification code below to set a new password:
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563A6; background-color: #eff6ff; padding: 12px 28px; border-radius: 8px; border: 1px dashed #93c5fd;">
                  ${resetToken}
                </span>
              </div>
              <p style="text-align: center; margin-bottom: 24px;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #2563A6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                  Reset Password Directly
                </a>
              </p>
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 0;">
                ⏱ This token is valid for 20 minutes and can only be used once.<br />
                If you did not request this, your account remains secure.
              </p>
            </div>
          </div>
        `,
      });

      console.log('[EmailService] SMTP Dispatch Successful:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.warn('[EmailService] SMTP Dispatch Error (falling back to logged token):', err.message);
      return { success: true, simulated: true, resetToken, note: 'Simulated due to SMTP error' };
    }
  }

  return { 
    success: true, 
    simulated: true, 
    resetToken,
    note: 'Simulated dispatch (configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env for external mail delivery)' 
  };
}
