import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'
import bcrypt from 'bcryptjs'

// Set vendor password after email verification (step 2)
export async function POST(request) {
  try {
    const { email, password, username, phoneNumber } = await request.json()

    console.log('Setting vendor password for:', { email, username, phoneNumber })

    if (!email || !password) {
      return Response.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // Decode URL-encoded email if needed
    const decodedEmail = email.includes('%40') ? decodeURIComponent(email) : email
    console.log('Decoded email:', decodedEmail)

    // Find user by email (must be verified)
    const user = await prisma.users.findFirst({
      where: {
        email: decodedEmail,
        emailVerification: true,
        password: null // User doesn't have password yet
      }
    })

    console.log('Found user:', user ? 'Yes' : 'No')

    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'User not found or email not verified' 
      }, { status: 400 })
    }

    // Create Firebase user
    let firebaseUser
    try {
      firebaseUser = await adminAuth.createUser({
        email: decodedEmail,
        password: password,
        displayName: username || user.username,
        emailVerified: true, // Mark as verified since they went through email verification
        disabled: false
      })
      console.log('Firebase user created:', firebaseUser.uid)
    } catch (firebaseError) {
      console.error('Error creating Firebase user:', firebaseError.message)
      
      // If user already exists in Firebase, try to get the existing user
      if (firebaseError.code === 'auth/email-already-exists') {
        try {
          firebaseUser = await adminAuth.getUserByEmail(decodedEmail)
          console.log('Found existing Firebase user:', firebaseUser.uid)
          
          // Update the existing Firebase user's password
          await adminAuth.updateUser(firebaseUser.uid, {
            password: password,
            displayName: username || user.username,
            emailVerified: true
          })
          console.log('Updated existing Firebase user password')
        } catch (updateError) {
          console.error('Error updating existing Firebase user:', updateError.message)
          return Response.json({ 
            success: false, 
            error: 'Failed to update existing user in Firebase' 
          }, { status: 500 })
        }
      } else {
        return Response.json({ 
          success: false, 
          error: 'Failed to create user in Firebase Authentication' 
        }, { status: 500 })
      }
    }

    // Hash the password for database storage
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user with password and Firebase UID
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        uid: firebaseUser.uid, // Update with real Firebase UID
        password: hashedPassword,
        username: username || user.username,
        phoneNumber: phoneNumber || user.phoneNumber
      }
    })

    console.log('Password set successfully for user:', updatedUser.email, 'Firebase UID:', firebaseUser.uid)

    return Response.json({ 
      success: true, 
      message: 'Password set successfully! You can now login to your account.',
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
    console.error('Error setting vendor password:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
