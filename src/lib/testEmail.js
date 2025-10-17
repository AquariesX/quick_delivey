// Test email configuration
import nodemailer from 'nodemailer'

export async function testEmailConfig() {
  console.log('Testing email configuration...')
  console.log('SMTP_HOST:', process.env.SMTP_HOST)
  console.log('SMTP_PORT:', process.env.SMTP_PORT)
  console.log('SMTP_USER:', process.env.SMTP_USER)
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET')
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email configuration missing!')
    return { success: false, error: 'SMTP credentials not configured' }
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Test connection
    await transporter.verify()
    console.log('✅ Email configuration is valid!')
    return { success: true }
  } catch (error) {
    console.log('❌ Email configuration error:', error.message)
    return { success: false, error: error.message }
  }
}
