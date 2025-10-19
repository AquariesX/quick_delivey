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

    console.log('Processing Firebase email verification with code:', oobCode.substring(0, 10) + '...')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID)

    // Use Firebase REST API to verify the email verification code
    let firebaseUser
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || "quick-delivery-fe107"
      const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA6Zwg3QRf2qmsv56WHdqI5MbnX6owH1ZY"
      
      console.log('Using API Key:', apiKey.substring(0, 10) + '...')
      
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:verifyEmailVerificationCode?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode: oobCode
        })
      })

      const result = await response.json()
      console.log('Firebase API Response Status:', response.status)
      console.log('Firebase API Response:', result)
      
      if (!response.ok) {
        console.error('Firebase API Error:', result)
        console.error('Request URL:', `https://identitytoolkit.googleapis.com/v1/accounts:verifyEmailVerificationCode?key=${apiKey.substring(0, 10)}...`)
        console.error('Request Body:', JSON.stringify({ oobCode: oobCode.substring(0, 10) + '...' }))
        throw new Error(result.error?.message || `HTTP ${response.status}: Verification failed`)
      }

      firebaseUser = {
        uid: result.localId,
        email: result.email,
        emailVerified: true
      }
      
      console.log('Firebase verification successful for email:', firebaseUser.email)
    } catch (error) {
      console.error('Firebase verification failed:', error.message)
      console.error('Full error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Invalid or expired verification code'
      if (error.message.includes('INVALID_OOB_CODE')) {
        errorMessage = 'Invalid verification code. Please request a new verification email.'
      } else if (error.message.includes('EXPIRED_OOB_CODE')) {
        errorMessage = 'Verification code has expired. Please request a new verification email.'
      } else if (error.message.includes('USER_DISABLED')) {
        errorMessage = 'This account has been disabled. Please contact support.'
      } else if (error.message.includes('INVALID_API_KEY')) {
        errorMessage = 'Configuration error. Please contact support.'
      }
      
      return Response.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 })
    }

    // Find user in database by email
    const user = await prisma.users.findFirst({
      where: {
        email: firebaseUser.email.toLowerCase().trim()
      }
    })

    if (!user) {
      console.log('User not found in database for email:', firebaseUser.email)
      return Response.json({ 
        success: false, 
        error: 'User not found. Please register first.' 
      }, { status: 404 })
    }

    console.log('Found user in database:', user.username, 'ID:', user.id)

    // Update Firebase user's email verification status
    try {
      await adminAuth.updateUser(firebaseUser.uid, {
        emailVerified: true
      })
      console.log('Firebase email verification status updated for user:', firebaseUser.uid)
    } catch (firebaseError) {
      console.warn('Failed to update Firebase email verification status:', firebaseError.message)
      // Continue with database update even if Firebase update fails
    }

    // Update user with Firebase UID and verification status
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        uid: firebaseUser.uid,
        emailVerification: true
      }
    })

    console.log('Email verification completed successfully for user:', updatedUser.username)

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
      error: error.message || 'An unexpected error occurred during verification' 
    }, { status: 500 })
  }
}
