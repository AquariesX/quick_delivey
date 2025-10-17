import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Set vendor password after email verification (step 2)
export async function POST(request) {
  try {
    const { email, password, username, phoneNumber } = await request.json()

    if (!email || !password) {
      return Response.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // Find user by email (must be verified)
    const user = await prisma.users.findFirst({
      where: {
        email: email,
        emailVerification: true,
        password: null // User doesn't have password yet
      }
    })

    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'User not found or email not verified' 
      }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user with password
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        username: username || user.username,
        phoneNumber: phoneNumber || user.phoneNumber
      }
    })

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
