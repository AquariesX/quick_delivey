import nodemailer from 'nodemailer'

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Send vendor invitation email
export const sendVendorInvitationEmail = async (vendorEmail, vendorUsername, verificationToken) => {
  try {
    const transporter = createTransporter()
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-vendor?token=${verificationToken}&email=${encodeURIComponent(vendorEmail)}`
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Quick Delivery'}" <${process.env.SMTP_USER}>`,
      to: vendorEmail,
      subject: 'Welcome to Quick Delivery - Vendor Account Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Quick Delivery!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your vendor account has been created</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${vendorUsername}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your vendor account has been created by our admin team. 
              You can now start managing your products and orders through our platform.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li>Click the verification button below to verify your email address</li>
                <li>Set up your password to secure your account</li>
                <li>Complete your vendor profile</li>
                <li>Start adding your products!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email & Set Password
              </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1976d2; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This verification link will expire in 24 hours. 
                If you don't verify your email within this time, please contact our support team.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This email was sent by Quick Delivery System</p>
              <p>If you didn't request this account, please ignore this email.</p>
            </div>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Vendor invitation email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending vendor invitation email:', error)
    return { success: false, error: error.message }
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, username, resetToken) => {
  try {
    const transporter = createTransporter()
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Quick Delivery'}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Reset Your Password - Quick Delivery',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Quick Delivery System</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your Quick Delivery account. 
              If you made this request, click the button below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Reset My Password
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security. 
                If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you have any questions or concerns, please contact our support team immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This email was sent by Quick Delivery System</p>
              <p>For security reasons, please do not share this link with anyone.</p>
            </div>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: error.message }
  }
}

// Send verification success email
export const sendVerificationSuccessEmail = async (userEmail, username) => {
  try {
    const transporter = createTransporter()
    
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Quick Delivery'}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Email Verified Successfully - Quick Delivery',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Verified!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to Quick Delivery</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${username}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your email has been successfully verified. 
              Your account is now fully activated and ready to use.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Access your dashboard to manage your account</li>
                <li>Complete your profile information</li>
                <li>Start exploring our platform features</li>
                <li>Contact support if you need any assistance</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for joining Quick Delivery! We're excited to have you on board.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This email was sent by Quick Delivery System</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Verification success email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending verification success email:', error)
    return { success: false, error: error.message }
  }
}
