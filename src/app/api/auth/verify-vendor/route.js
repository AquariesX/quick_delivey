import { prisma } from '@/lib/prisma'
import { sendVendorInvitationEmail, sendVerificationSuccessEmail } from '@/lib/emailService'
import { adminAuth } from '@/lib/firebase-admin'
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

    // If email is already verified (admin-created vendor), check if Firebase user exists
    if (user.emailVerification) {
      console.log('Email already verified, checking Firebase user')
      
      // Check if user has a real Firebase UID (not temp)
      if (user.uid && !user.uid.startsWith('temp_')) {
        console.log('Firebase user already exists, returning success')
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
      } else {
        // User is verified but doesn't have Firebase account, create one
        console.log('Creating Firebase user for verified vendor')
        return await createFirebaseUserForVendor(user, decodedEmail)
      }
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

    // Verify the email and create Firebase user
    console.log('Verifying email and creating Firebase user')
    return await createFirebaseUserForVendor(user, decodedEmail)
  } catch (error) {
    console.error('Error verifying vendor email:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// Helper function to create Firebase user for vendor
async function createFirebaseUserForVendor(user, email) {
  try {
    // Generate a random password for the vendor
    const randomPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
    
    // Generate a Firebase-compatible UID (32 characters, alphanumeric)
    const firebaseUID = crypto.randomBytes(16).toString('hex')
    
    console.log('Generated Firebase UID:', firebaseUID)
    console.log('Generated password length:', randomPassword.length)
    
    // Hash the password for database storage
    const hashedPassword = await bcrypt.hash(randomPassword, 12)

    // Update user with Firebase UID, password, and verification status
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        uid: firebaseUID,
        password: hashedPassword,
        emailVerification: true,
        verificationToken: null // Clear the token after verification
      }
    })

    console.log('Updated user with new UID:', updatedUser.uid)

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
    console.error('Error creating Firebase user for vendor:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to create Firebase user' 
    }, { status: 500 })
  }
}
