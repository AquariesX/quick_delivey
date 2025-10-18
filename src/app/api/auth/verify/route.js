import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { oobCode } = await request.json()
    
    if (!oobCode) {
      return Response.json({ 
        success: false, 
        error: 'Verification code is required' 
      }, { status: 400 })
    }

    console.log('Processing Firebase email verification...')

    // Verify the Firebase email verification code
    let firebaseUser
    try {
      firebaseUser = await adminAuth.verifyEmailVerificationCode(oobCode)
      console.log('Firebase verification successful:', firebaseUser.email)
    } catch (error) {
      console.error('Firebase verification failed:', error.message)
      return Response.json({ 
        success: false, 
        error: 'Invalid or expired verification code' 
      }, { status: 400 })
    }

    // Find user in database by email
    const user = await prisma.users.findFirst({
      where: {
        email: firebaseUser.email.toLowerCase().trim()
      }
    })

    if (!user) {
      console.log('User not found in database:', firebaseUser.email)
      return Response.json({ 
        success: false, 
        error: 'User not found. Please register first.' 
      }, { status: 404 })
    }

    console.log('Found user:', user.username)

    // Update user with Firebase UID and verification status
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        uid: firebaseUser.uid,
        emailVerification: true
      }
    })

    console.log('Email verification completed successfully')

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
    console.error('Email verification error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
