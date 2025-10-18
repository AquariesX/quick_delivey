import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return Response.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    console.log('=== DATABASE AUTHENTICATION ===')
    console.log('Email:', email)
    
    // Find user in database
    const user = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase().trim()
      }
    })
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }
    
    console.log('Found user:', user.username)
    console.log('User role:', user.role)
    console.log('Email verification:', user.emailVerification)
    
    // Check if user has a password
    if (!user.password) {
      return Response.json({ 
        success: false, 
        error: 'Account not properly set up. Please contact support.' 
      }, { status: 401 })
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return Response.json({ 
        success: false, 
        error: 'Invalid email or password' 
      }, { status: 401 })
    }
    
    // Check email verification for vendors
    if (user.role === 'VENDOR' && !user.emailVerification) {
      return Response.json({ 
        success: false, 
        error: 'Please verify your email before signing in.' 
      }, { status: 401 })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        uid: user.uid,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )
    
    console.log('Authentication successful for:', user.username)
    
    return Response.json({ 
      success: true, 
      message: 'Authentication successful',
      token: token,
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
    
  } catch (error) {
    console.error('Database authentication error:', error)
    return Response.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 })
  }
}
