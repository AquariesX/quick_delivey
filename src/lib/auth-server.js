import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'

// Check if user is verified and has proper data
export function checkUserVerification(user, userData) {
  if (!user) {
    return { isVerified: false, reason: 'No user' }
  }
  
  if (!user.emailVerified) {
    return { isVerified: false, reason: 'Email not verified' }
  }
  
  if (!userData) {
    return { isVerified: false, reason: 'No user data' }
  }
  
  if (!userData.emailVerification) {
    return { isVerified: false, reason: 'Database verification pending' }
  }
  
  return { isVerified: true, reason: 'All checks passed' }
}

// Verify Firebase token and get user data
export async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying Firebase token:', error)
    throw new Error('Invalid token')
  }
}

// Get or create user in database
export async function getOrCreateUser(firebaseUser) {
  try {
    // Check if user exists
    let user = await prisma.users.findUnique({
      where: { uid: firebaseUser.uid }
    })

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.users.create({
        data: {
          uid: firebaseUser.uid,
          username: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phone_number || '',
          role: 'CUSTOMER',
          emailVerification: firebaseUser.email_verified || false,
          type: 'user'
        }
      })
    }

    return user
  } catch (error) {
    console.error('Error getting/creating user:', error)
    throw new Error('Database error')
  }
}

// Middleware to authenticate requests
export async function authenticateRequest(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.split('Bearer ')[1]
  const firebaseUser = await verifyFirebaseToken(token)
  const user = await getOrCreateUser(firebaseUser)
  
  return user
}
