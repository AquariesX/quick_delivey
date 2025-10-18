import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendTestEmail } from '@/lib/simpleEmail'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    console.log('=== VENDOR PASSWORD RESET ===')
    console.log('Email:', email)
    
    // Find the vendor
    const user = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        role: 'VENDOR'
      }
    })
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Vendor not found' 
      }, { status: 404 })
    }
    
    console.log('Found vendor:', user.username)
    console.log('Email verification:', user.emailVerification)
    
    if (!user.emailVerification) {
      return Response.json({ 
        success: false, 
        error: 'Please verify your email first' 
      }, { status: 400 })
    }
    
    // Generate a new password
    const newPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update user password
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })
    
    console.log('Password updated for vendor:', user.username)
    
    // Send password via email
    try {
      await sendTestEmail(
        email,
        'Your New Password - Quick Delivery',
        `Hello ${user.username},\n\nYour password has been reset. Here are your new login credentials:\n\nEmail: ${email}\nPassword: ${newPassword}\n\nPlease login and change your password for security.\n\nBest regards,\nQuick Delivery Team`
      )
      console.log('Password email sent successfully')
    } catch (emailError) {
      console.error('Error sending password email:', emailError)
      // Don't fail the request if email fails
    }
    
    return Response.json({ 
      success: true, 
      message: 'Password reset successfully. Check your email for the new password.',
      password: newPassword // Only for testing, remove in production
    })
    
  } catch (error) {
    console.error('Password reset error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
