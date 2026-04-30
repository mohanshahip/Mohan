// utils/emailService.js
const nodemailer = require('nodemailer');
const logger = require('./Logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    
    this.initialize();
  }

  initialize() {
    // Check if email credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const isGmail = process.env.EMAIL_HOST?.includes('gmail');
        
        const config = {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_PORT === '465', // true for 465, false for others
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false // Often needed for local dev or certain SMTP servers
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        };

        // If it's Gmail, use service instead of host/port for better compatibility
        if (isGmail) {
          delete config.host;
          delete config.port;
          config.service = 'gmail';
        }

        this.transporter = nodemailer.createTransport(config);
        
        this.isConfigured = true;
        this.verifyConnection();
      } catch (error) {
        logger.error(`❌ Email service initialization error: ${error.message}`);
        this.isConfigured = false;
      }
    } else {
      logger.warn('⚠️ Email credentials missing. Emails will be logged to console.');
      this.isConfigured = false;
    }
  }

  async verifyConnection() {
    if (!this.transporter) return;
    
    try {
      await this.transporter.verify();
      logger.info('✅ Email service ready to send messages');
    } catch (error) {
      if (error.message.includes('BadCredentials') || error.message.includes('Invalid login')) {
        logger.warn('\n⚠️ GMAIL AUTHENTICATION FAILED (Email features will be disabled):');
        logger.warn('   Your App Password was rejected by Google.');
        logger.warn('   Please generate a NEW App Password: https://myaccount.google.com/apppasswords');
        logger.warn('   Ensure 2-Step Verification is ENABLED first.\n');
      } else {
        logger.warn(`⚠️ Email service connection warning: ${error.message}`);
      }
      this.isConfigured = false;
    }
  }

  async sendPasswordResetEmail(email, resetUrl) {
    // If no transporter, log to console (development only)
    if (!this.isConfigured || !this.transporter) {
      console.log('\n🔐 PASSWORD RESET LINK (Development):');
      console.log(resetUrl);
      console.log('📧 Would be sent to:', email);
      console.log('⚠️  This is a development log - no email was sent\n');
      
      return { 
        success: true, 
        messageId: 'dev-mode-no-email',
        devMode: true 
      };
    }

    const fromName = process.env.FROM_NAME || 'Portfolio Admin';
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      html: this.getPasswordResetTemplate(resetUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, username, password) {
    if (!this.isConfigured || !this.transporter) {
      console.log('\n👋 WELCOME EMAIL (Development):');
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Temporary Password: ${password}`);
      console.log('⚠️  This is a development log - no email was sent\n');
      
      return { success: true, devMode: true };
    }

    const fromName = process.env.FROM_NAME || 'Portfolio Admin';
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Welcome to Portfolio Admin',
      html: this.getWelcomeTemplate(username, password),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendOTPEmail(email, otp, type = 'verification') {
    console.log(`Attempting to send OTP email to ${email}. Configured: ${this.isConfigured}`);
    if (!this.isConfigured || !this.transporter) {
      console.log('\n🔢 OTP EMAIL (Development):');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Type: ${type}`);
      console.log('⚠️  This is a development log - no email was sent\n');
      
      return { success: true, devMode: true };
    }

    const fromName = process.env.FROM_NAME || 'Portfolio Admin';
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

    const subjects = {
      verification: 'Verify Your Email',
      passwordReset: 'Password Reset OTP',
      login: 'Login Verification Code'
    };

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: subjects[type] || 'Verification Code',
      html: this.getOTPTemplate(otp, type),
    };

    console.log('Mail Options:', { ...mailOptions, html: '[HTML Content]' });

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ OTP email error:', error);
      // Fallback to console if SMTP fails
      console.log('\n🔢 OTP EMAIL (FALLBACK):');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Error: ${error.message}\n`);
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }

  getOTPTemplate(otp, type) {
    const titles = {
      verification: 'Verify Your Email',
      passwordReset: 'Reset Your Password',
      login: 'Login Verification'
    };

    const messages = {
      verification: 'Please use the following 6-digit code to verify your email address:',
      passwordReset: 'A password reset was requested for your account. Use this code to reset your password:',
      login: 'Use this code to complete your login process:'
    };

    const title = titles[type] || 'Verification Code';
    const message = messages[type] || 'Your verification code is:';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">${title}</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px;">Hello,</p>
          
          <p style="font-size: 16px;">${message}</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <div style="background-color: #f5f5f5; border: 2px dashed #667eea; color: #764ba2; font-size: 36px; font-weight: 700; padding: 20px; border-radius: 10px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #f44336; font-weight: 500;">⚠️ This code will expire in 10 minutes</p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 13px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px;">Hello,</p>
          
          <p style="font-size: 16px;">We received a request to reset your password for your admin account. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 12px; border-radius: 6px; font-size: 14px; word-break: break-all; border: 1px solid #e0e0e0;">
            ${resetUrl}
          </p>
          
          <p style="font-size: 14px; color: #f44336; font-weight: 500;">⚠️ This link will expire in 10 minutes</p>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 13px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(username, password) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Portfolio Admin</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Portfolio Admin!</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px;">Hello,</p>
          
          <p style="font-size: 16px;">An admin account has been created for you. Here are your login credentials:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);">
              Login to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #f44336; font-weight: 500;">⚠️ For security reasons, please change your password after first login.</p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="color: #999; font-size: 13px; text-align: center;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
module.exports = new EmailService();