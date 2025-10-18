import { prisma } from '@/lib/prisma'
import { sendVendorInvitationEmail, sendVerificationEmail } from '@/lib/emailService'
import { sendTestEmail } from '@/lib/simpleEmail'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { uid, username, email, phoneNumber, role, type, password, sendInvitationEmail, generateVerificationToken } = await request.json()

    // Validate required fields
    if (!uid && role !== 'VENDOR') {
      return Response.json({ 
        success: false, 
        error: 'UID is required',
        code: 'MISSING_UID'
      }, { status: 400 })
    }

    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      }, { status: 400 })
    }

    // Check if user already exists by email (prevent duplicates)
    const existingUserByEmail = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUserByEmail && existingUserByEmail.uid !== uid) {
      // Update the existing user's UID to match the new Firebase UID
      const updatedUser = await prisma.users.update({
        where: { id: existingUserByEmail.id },
        data: {
          uid: uid, // Update UID to match Firebase
          emailVerification: true // Mark as verified since they're logging in
        }
      })
      
      return Response.json({ 
        success: true, 
        user: updatedUser,
        message: 'User UID updated to match Firebase authentication' 
      })
    }

    // Check if user already exists by UID (for updates) - only if UID is provided
    let existingUserByUID = null
    if (uid) {
      existingUserByUID = await prisma.users.findUnique({
        where: { uid }
      })
    }

    if (existingUserByUID) {
      // Validate and convert role to enum
      const validRoles = ['ADMIN', 'SUPER_ADMIN', 'DRIVER', 'VENDOR', 'CUSTOMER']
      const userRole = validRoles.includes(role) ? role : existingUserByUID.role
      
      // Update existing user with new data
      const updatedUser = await prisma.users.update({
        where: { id: existingUserByUID.id },
        data: {
          uid,
          username: username || existingUserByUID.username,
          phoneNumber: phoneNumber || existingUserByUID.phoneNumber,
          role: userRole,
          type: type || existingUserByUID.type
        }
      })
      
      return Response.json({ 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      })
    }

    // Validate and convert role to enum
    const validRoles = ['ADMIN', 'SUPER_ADMIN', 'DRIVER', 'VENDOR', 'CUSTOMER']
    const userRole = validRoles.includes(role) ? role : 'CUSTOMER'

    // Generate verification token based on requirements
    let verificationToken = null
    let hashedPassword = null
    
    if (sendInvitationEmail && role === 'VENDOR') {
      // Generate a random password for admin-created vendors
      const randomPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
      hashedPassword = await bcrypt.hash(randomPassword, 12)
      verificationToken = crypto.randomBytes(32).toString('hex')
    } else if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
      // Generate verification token for all users with passwords (except auto-verified)
      if (role === 'VENDOR' || generateVerificationToken) {
        verificationToken = crypto.randomBytes(32).toString('hex')
      }
    } else if (generateVerificationToken) {
      // Generate verification token for users without passwords
      verificationToken = crypto.randomBytes(32).toString('hex')
    }

    // Create new user
    const user = await prisma.users.create({
      data: {
        uid: uid || `temp_${Date.now()}`, // Use temp UID for vendors, will be updated when they set password
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        role: userRole,
        type: type || 'firebase',
        emailVerification: sendInvitationEmail && role === 'VENDOR' ? true : (password && !generateVerificationToken ? true : false), // Auto-verify admin-created vendors and users without verification tokens
        verificationToken: verificationToken
      }
    })

    // Send verification email for all user types who need verification
    if (verificationToken && !emailVerification) {
      try {
        let emailResult
        
        if (role === 'VENDOR') {
          // Use vendor-specific email for vendors
          emailResult = await sendVendorInvitationEmail(email, username, verificationToken)
        } else {
          // Use general verification email for other roles
          emailResult = await sendVerificationEmail(email, username, verificationToken, role)
        }
        
        // If that fails, try a simple email
        if (!emailResult.success) {
          const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}&role=${role}`
          await sendTestEmail(
            email, 
            'Verify Your Email - Quick Delivery',
            `Hello ${username},\n\nPlease click the link below to verify your email and activate your account:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nQuick Delivery Team`
          )
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return Response.json({ 
      success: true, 
      user,
      message: sendInvitationEmail ? 'User created successfully and invitation email sent' : 'User created successfully' 
    })
  } catch (error) {
    console.error('Error creating user:', error.message)
    return Response.json({ 
      success: false, 
      error: error.message,
      code: 'USER_CREATION_ERROR'
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const email = searchParams.get('email')
    const role = searchParams.get('role')

    if (uid) {
      // Fetch specific user by UID
      const user = await prisma.users.findUnique({
        where: { uid },
        include: {
          productsAsVendor: {
            include: {
              category: true,
              subCategory: true
            }
          }
        }
      })

      if (!user) {
        return Response.json({ 
          success: false, 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }, { status: 404 })
      }

      return Response.json({ 
        success: true, 
        user 
      })
    } else if (email) {
      // Fetch specific user by email
      const user = await prisma.users.findUnique({
        where: { email },
        include: {
          productsAsVendor: {
            include: {
              category: true,
              subCategory: true
            }
          }
        }
      })

      if (!user) {
        return Response.json({ 
          success: false, 
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        }, { status: 404 })
      }

      return Response.json({ 
        success: true, 
        user 
      })
    } else if (role) {
      // Fetch users by role
      const users = await prisma.users.findMany({
        where: { role },
        include: {
          productsAsVendor: {
            include: {
              category: true,
              subCategory: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return Response.json({ 
        success: true, 
        data: users 
      })
    } else {
      // Fetch all users
      const users = await prisma.users.findMany({
        include: {
          productsAsVendor: {
            include: {
              category: true,
              subCategory: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return Response.json({ 
        success: true, 
        data: users 
      })
    }
  } catch (error) {
    console.error('Error fetching users:', error.message)
    return Response.json({ 
      success: false, 
      error: error.message,
      code: 'SERVER_ERROR'
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { uid, emailVerification, username, phoneNumber, role } = await request.json()

    const updateData = {}
    if (emailVerification !== undefined) updateData.emailVerification = emailVerification
    if (username) updateData.username = username
    if (phoneNumber) updateData.phoneNumber = phoneNumber
    if (role) updateData.role = role

    const user = await prisma.users.update({
      where: { uid },
      data: updateData
    })

    return Response.json({ 
      success: true, 
      user 
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return Response.json({ 
        success: false, 
        error: 'UID is required' 
      }, { status: 400 })
    }

    // Check if user has products
    const userWithProducts = await prisma.users.findUnique({
      where: { uid },
      include: {
        productsAsVendor: true
      }
    })

    if (!userWithProducts) {
      return Response.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    if (userWithProducts.productsAsVendor.length > 0) {
      return Response.json({ 
        success: false, 
        error: 'Cannot delete vendor with existing products. Please transfer or delete products first.' 
      }, { status: 400 })
    }

    // Delete the user
    await prisma.users.delete({
      where: { uid }
    })

    return Response.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}