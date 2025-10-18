import { sendVendorInvitationEmail, sendTestEmail } from '@/lib/emailService'

export async function POST(request) {
  try {
    const { email, username, testType = 'simple' } = await request.json()
    
    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email address is required' 
      }, { status: 400 })
    }

    console.log('=== EMAIL TESTING START ===')
    console.log('Email:', email)
    console.log('Username:', username || 'Test User')
    console.log('Test Type:', testType)
    console.log('SMTP Configuration:')
    console.log('- Host:', process.env.SMTP_HOST)
    console.log('- Port:', process.env.SMTP_PORT)
    console.log('- User:', process.env.SMTP_USER)
    console.log('- Pass:', process.env.SMTP_PASS ? 'SET' : 'NOT_SET')
    console.log('- App URL:', process.env.NEXT_PUBLIC_APP_URL)
    console.log('========================')

    let result
    
    if (testType === 'vendor') {
      // Test vendor invitation email
      const verificationToken = 'test-token-12345'
      result = await sendVendorInvitationEmail(email, username || 'Test User', verificationToken)
    } else {
      // Test simple email
      result = await sendTestEmail(
        email,
        'Test Email - Quick Delivery System',
        `Hello ${username || 'Test User'}!\n\nThis is a test email from Quick Delivery System.\n\nIf you receive this email, the email configuration is working correctly.\n\nBest regards,\nQuick Delivery Team`
      )
    }
    
    console.log('Email sending result:', result)
    console.log('=== EMAIL TESTING END ===')
    
    if (result.success) {
      return Response.json({ 
        success: true, 
        message: `${testType} email sent successfully`,
        messageId: result.messageId,
        testType: testType
      })
    } else {
      return Response.json({ 
        success: false, 
        error: result.error,
        testType: testType
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error testing email:', error)
    return Response.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}