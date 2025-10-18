import { prisma } from '@/lib/prisma'
import { adminAuth } from '@/lib/firebase-admin'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    console.log('=== CREATING FIREBASE USER FOR VENDOR ===')
    console.log('Email:', email)
    
    // Find the vendor in database
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
    console.log('Current UID:', user.uid)
    
    // Generate a password for Firebase
    const firebasePassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
    console.log('Generated Firebase password length:', firebasePassword.length)
    
    // Try to create Firebase user
    try {
      const firebaseUser = await adminAuth.createUser({
        email: email,
        password: firebasePassword,
        displayName: user.username,
        emailVerified: true,
        disabled: false
      })
      
      console.log('Firebase user created successfully:', firebaseUser.uid)
      
      // Update database with Firebase UID
      const updatedUser = await prisma.users.update({
        where: { id: user.id },
        data: {
          uid: firebaseUser.uid
        }
      })
      
      return Response.json({ 
        success: true, 
        message: 'Firebase user created successfully',
        firebaseUID: firebaseUser.uid,
        databaseUID: updatedUser.uid,
        password: firebasePassword // For testing only
      })
      
    } catch (firebaseError) {
      console.error('Firebase creation error:', firebaseError.message)
      
      if (firebaseError.code === 'auth/email-already-exists') {
        // User already exists in Firebase
        try {
          const existingUser = await adminAuth.getUserByEmail(email)
          console.log('Found existing Firebase user:', existingUser.uid)
          
          // Update database UID to match Firebase
          const updatedUser = await prisma.users.update({
            where: { id: user.id },
            data: {
              uid: existingUser.uid
            }
          })
          
          return Response.json({ 
            success: true, 
            message: 'Firebase user already exists, UID updated',
            firebaseUID: existingUser.uid,
            databaseUID: updatedUser.uid
          })
        } catch (getError) {
          console.error('Error getting existing user:', getError.message)
          return Response.json({ 
            success: false, 
            error: 'Failed to get existing Firebase user' 
          }, { status: 500 })
        }
      } else {
        return Response.json({ 
          success: false, 
          error: 'Failed to create Firebase user: ' + firebaseError.message 
        }, { status: 500 })
      }
    }
    
  } catch (error) {
    console.error('Create Firebase user error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
