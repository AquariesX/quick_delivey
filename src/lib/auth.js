import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'

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
          phonenumber: firebaseUser.phone_number || '',
          role: 'Customer', // Default role
          emailVerification: firebaseUser.email_verified || false,
          type: 'firebase'
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
