import { prisma } from '@/lib/prisma'
import { sendVendorInvitationEmail, sendVerificationSuccessEmail } from '@/lib/emailService'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Verify vendor email first (step 1)
export async function POST(request) {
  try {
    const { token, email } = await request.json()

    console.log('Verifying vendor with:', { token: token ? 'present' : 'missing', email })

    if (!token || !email) {
      return Response.json({ 
        success: false, 
        error: 'Token and email are required' 
      }, { status: 400 })
    }

    // Decode URL-encoded email if needed
    const decodedEmail = email.includes('%40') ? decodeURIComponent(email) : email
    console.log('Decoded email:', decodedEmail)

    // Find user by email and verification token
    const user = await prisma.users.findFirst({
      where: {
        email: decodedEmail,
        verificationToken: token
      }
    })

    console.log('Found user for verification:', user ? 'Yes' : 'No')
    console.log('User email verification status:', user?.emailVerification)

    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Invalid or expired verification token' 
      }, { status: 400 })
    }

    // If email is already verified (admin-created vendor), just return success
    if (user.emailVerification) {
      console.log('Email already verified, returning success')
      return Response.json({ 
        success: true, 
        message: 'Email already verified! Your account is active.',
        user: {
          id: user.id,
          uid: user.uid,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          emailVerification: user.emailVerification
        }
      })
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - new Date(user.createdAt).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return Response.json({ 
        success: false, 
        error: 'Verification token has expired' 
      }, { status: 400 })
    }

    // Verify the email (step 1)
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        emailVerification: true,
        verificationToken: null // Clear the token after verification
      }
    })

    // Send verification success email
    try {
      await sendVerificationSuccessEmail(user.email, user.username)
    } catch (emailError) {
      console.error('Error sending verification success email:', emailError)
      // Don't fail the request if email fails
    }

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully! Your account is now active.',
      user: {
        id: updatedUser.id,
        uid: updatedUser.uid,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        emailVerification: updatedUser.emailVerification
      }
    })
  } catch (error) {
    console.error('Error verifying vendor email:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
