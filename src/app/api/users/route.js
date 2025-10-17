import { prisma } from '@/lib/prisma'
import { sendVendorInvitationEmail } from '@/lib/emailService'
import { sendTestEmail } from '@/lib/simpleEmail'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { uid, username, email, phoneNumber, role, type, password, sendInvitationEmail } = await request.json()

    console.log('Creating user with data:', { uid, username, email, phoneNumber, role, type, sendInvitationEmail })

    // Check if user already exists by email (prevent duplicates)
    const existingUserByEmail = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      console.log('User already exists with this email:', existingUserByEmail)
      return Response.json({ 
        success: false, 
        error: `A user with email "${email}" already exists. Please use a different email address.`,
        code: 'EMAIL_ALREADY_EXISTS'
      }, { status: 400 })
    }

    // Check if user already exists by UID (for updates)
    const existingUserByUID = await prisma.users.findUnique({
      where: { uid }
    })

    if (existingUserByUID) {
      console.log('User already exists with this UID:', existingUserByUID)
      
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
      
      console.log('Updated existing user:', updatedUser)
      
      return Response.json({ 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      })
    }

    // Validate and convert role to enum
    const validRoles = ['ADMIN', 'SUPER_ADMIN', 'DRIVER', 'VENDOR', 'CUSTOMER']
    const userRole = validRoles.includes(role) ? role : 'CUSTOMER'

    console.log('Creating user with role:', userRole)

    // Generate verification token if sending invitation email
    let verificationToken = null
    let hashedPassword = null
    
    if (sendInvitationEmail && role === 'VENDOR') {
      verificationToken = crypto.randomBytes(32).toString('hex')
    } else if (password) {
      hashedPassword = await bcrypt.hash(password, 12)
    }

    // Create new user
    const user = await prisma.users.create({
      data: {
        uid,
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        role: userRole,
        type: type || 'firebase',
        emailVerification: password ? true : false, // Auto-verify if password provided
        verificationToken: verificationToken
      }
    })

    console.log('User created successfully:', user)

    // Send invitation email if requested
    if (sendInvitationEmail && role === 'VENDOR' && verificationToken) {
      try {
        // Try the full HTML email first
        const emailResult = await sendVendorInvitationEmail(email, username, verificationToken)
        console.log('Invitation email sent:', emailResult)
        
        // If that fails, try a simple email
        if (!emailResult.success) {
          console.log('Trying simple email fallback...')
          const simpleEmailResult = await sendTestEmail(
            email, 
            'Welcome to Quick Delivery - Vendor Account Created',
            `Hello ${username},\n\nYour vendor account has been created. Please click the link below to verify your email and set your password:\n\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/verify-vendor?token=${verificationToken}&email=${encodeURIComponent(email)}\n\nThis link will expire in 24 hours.\n\nBest regards,\nQuick Delivery Team`
          )
          console.log('Simple email result:', simpleEmailResult)
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return Response.json({ 
      success: true, 
      user,
      message: sendInvitationEmail ? 'User created successfully and invitation email sent' : 'User created successfully' 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')
    const role = searchParams.get('role')

    console.log('Fetching users with params:', { uid, role })

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

      console.log('Found user:', user)

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
    console.error('Error fetching users:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
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