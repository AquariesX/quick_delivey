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

    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message)
      return Response.json({ 
        success: false, 
        error: 'Database connection failed. Please try again later.' 
      }, { status: 500 })
    }

    // Decode URL-encoded email if needed
    const decodedEmail = email.includes('%40') ? decodeURIComponent(email) : email
    console.log('Decoded email:', decodedEmail)

    // Find user by email (must be verified) with retry
    let user
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        user = await prisma.users.findFirst({
          where: {
            email: decodedEmail,
            emailVerification: true
          }
        })
        break // Success, exit retry loop
      } catch (dbError) {
        retryCount++
        console.log(`Database query attempt ${retryCount} failed:`, dbError.message)
        if (retryCount >= maxRetries) {
          console.error('All database query attempts failed')
          return Response.json({ 
            success: false, 
            error: 'Database connection issue. Please try again later.' 
          }, { status: 500 })
        }
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Found user:', user ? 'Yes' : 'No')

    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'User not found or email not verified' 
      }, { status: 400 })
    }

    // Check if user already has a password (direct registration case)
    if (user.password) {
      // User already has password, just update Firebase user
      let firebaseUser
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
        
        // Update database user
        const updatedUser = await prisma.users.update({
          where: { id: user.id },
          data: {
            uid: firebaseUser.uid || user.uid, // Ensure UID is set, fallback to existing
            username: username || user.username,
            phoneNumber: phoneNumber || user.phoneNumber
          }
        })
        
        return Response.json({ 
          success: true,
          message: 'Password updated successfully! You can now login to your account.',
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
      } catch (firebaseError) {
        console.error('Error updating Firebase user:', firebaseError.message)
        return Response.json({ 
          success: false, 
          error: 'Failed to update user in Firebase Authentication' 
        }, { status: 500 })
      }
    }

    // Create Firebase user for admin-invited vendors
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
        uid: firebaseUser.uid || user.uid, // Update with real Firebase UID, fallback to existing
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
