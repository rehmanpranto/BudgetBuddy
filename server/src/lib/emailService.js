import nodemailer from 'nodemailer';

// Create transporter (you'll need to configure this with your email provider)
const transporter = nodemailer.createTransport({
  // For Gmail (example)
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your app password
  }
  
  // For other providers, use SMTP settings:
  /*
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
  */
});

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - BudgetBuddy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">BudgetBuddy</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #374151; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.5;">
            If you didn't request this password reset, please ignore this email. This link will expire in 1 hour.
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link in your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="background-color: #e5e7eb; padding: 15px; text-align: center;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © 2025 BudgetBuddy. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export default { sendPasswordResetEmail };
