import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request) {
  try {
    const { oobCode } = await request.json()

    if (!oobCode) {
      return NextResponse.json({
        success: false,
        error: 'No verification code provided'
      }, { status: 400 })
    }

    try {
      // Verify the action code using Firebase Admin SDK
      const actionCodeInfo = await adminAuth.checkActionCode(oobCode)
      
      // Apply the action code to verify the email
      await adminAuth.applyActionCode(oobCode)
      
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        email: actionCodeInfo.data.email
      })
    } catch (error) {
      console.error('Firebase Admin verification error:', error)
      
      let errorMessage = 'Email verification failed'
      switch (error.code) {
        case 'auth/invalid-action-code':
          errorMessage = 'Invalid or expired verification link'
          break
        case 'auth/expired-action-code':
          errorMessage = 'Verification link has expired'
          break
        case 'auth/user-disabled':
          errorMessage = 'User account has been disabled'
          break
        default:
          errorMessage = error.message || 'Email verification failed'
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({
      success: false,
      error: 'Server error occurred'
    }, { status: 500 })
  }
}
