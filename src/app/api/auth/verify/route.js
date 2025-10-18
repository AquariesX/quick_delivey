import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationSuccessEmail } from '@/lib/emailService'

export async function POST(request) {
  try {
    const { token, email, role = 'USER' } = await request.json()
    
    if (!token || !email) {
      return Response.json({ 
        success: false, 
        error: 'Token and email are required' 
      }, { status: 400 })
    }

    console.log('=== UNIFIED EMAIL VERIFICATION ===')
    console.log('Email:', email)
    console.log('Role:', role)
    console.log('Token:', token ? 'present' : 'missing')

    // Find user by email and token
    const user = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        verificationToken: token
      }
    })

    if (!user) {
      console.log('User not found or invalid token')
      return Response.json({ 
        success: false, 
        error: 'Invalid or expired verification token' 
      }, { status: 400 })
    }

    console.log('Found user:', user.username)
    console.log('Current verification status:', user.emailVerification)
    console.log('Current UID:', user.uid)

    // If already verified, return success
    if (user.emailVerification && !user.uid.startsWith('temp_')) {
      console.log('User already verified with proper UID')
      return Response.json({ 
        success: true, 
        message: 'Email already verified! Your account is active.',
        user: {
          id: user.id,
          uid: user.uid,
          username: user.username,
          email: user.email,
          role: user.role,
          emailVerification: user.emailVerification
        }
      })
    }

    // Handle verification based on user role
    if (user.role === 'VENDOR') {
      return await handleVendorVerification(user, email)
    } else {
      return await handleUserVerification(user, email)
    }

  } catch (error) {
    console.error('Verification error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

async function handleVendorVerification(user, email) {
  try {
    console.log('Handling vendor verification...')
    
    // Generate a random password for Firebase
    const randomPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
    
    // Try to create Firebase user
    let firebaseUID
    try {
      console.log('Attempting to create Firebase user...')
      const firebaseUser = await adminAuth.createUser({
        email: email,
        password: randomPassword,
        displayName: user.username,
        emailVerified: true,
        disabled: false
      })
      firebaseUID = firebaseUser.uid
      console.log('Firebase user created successfully:', firebaseUID)
    } catch (firebaseError) {
      console.error('Firebase creation failed:', firebaseError.message)
      
      // If user already exists, get existing user
      if (firebaseError.code === 'auth/email-already-exists') {
        try {
          const existingUser = await adminAuth.getUserByEmail(email)
          firebaseUID = existingUser.uid
          console.log('Found existing Firebase user:', firebaseUID)
          
          // Update password
          await adminAuth.updateUser(firebaseUID, {
            password: randomPassword,
            displayName: user.username,
            emailVerified: true
          })
        } catch (updateError) {
          console.error('Error updating existing Firebase user:', updateError.message)
          firebaseUID = crypto.randomBytes(16).toString('hex')
        }
      } else {
        // Generate fallback UID
        firebaseUID = crypto.randomBytes(16).toString('hex')
        console.log('Generated fallback UID:', firebaseUID)
      }
    }
    
    // Handle password preservation for vendors
    let finalPassword = user.password
    let passwordToUse = randomPassword
    
    if (user.password && !user.password.startsWith('$2b$')) {
      // User has a plain text password from direct registration
      finalPassword = await bcrypt.hash(user.password, 12)
      passwordToUse = user.password
    } else if (user.password && user.password.startsWith('$2b$')) {
      // User already has a hashed password
      finalPassword = user.password
      passwordToUse = 'existing_password'
    } else {
      // User doesn't have a password, use the generated one
      finalPassword = await bcrypt.hash(randomPassword, 12)
    }

    // Update user with Firebase UID and verification status
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        uid: firebaseUID,
        password: finalPassword,
        emailVerification: true,
        verificationToken: null
      }
    })

    console.log('Vendor verification completed:', updatedUser.uid)

    // Send success email
    try {
      await sendVerificationSuccessEmail(user.email, user.username)
    } catch (emailError) {
      console.error('Error sending success email:', emailError)
    }

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully! Your vendor account is now active.',
      user: {
        id: updatedUser.id,
        uid: updatedUser.uid,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerification: updatedUser.emailVerification
      }
    })

  } catch (error) {
    console.error('Vendor verification error:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to verify vendor account' 
    }, { status: 500 })
  }
}

async function handleUserVerification(user, email) {
  try {
    console.log('Handling user verification...')
    
    // For non-vendor users, just mark as verified
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        emailVerification: true,
        verificationToken: null
      }
    })

    console.log('User verification completed')

    // Send success email
    try {
      await sendVerificationSuccessEmail(user.email, user.username)
    } catch (emailError) {
      console.error('Error sending success email:', emailError)
    }

    return Response.json({ 
      success: true, 
      message: 'Email verified successfully! Your account is now active.',
      user: {
        id: updatedUser.id,
        uid: updatedUser.uid,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerification: updatedUser.emailVerification
      }
    })

  } catch (error) {
    console.error('User verification error:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to verify user account' 
    }, { status: 500 })
  }
}
