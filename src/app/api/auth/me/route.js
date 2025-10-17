import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const user = await authenticateRequest(request)
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        username: user.username,
        role: user.role,
        emailVerification: user.emailVerification,
        type: user.type
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { uid, username, phonenumber, role, type } = body
    
    // Verify Firebase token first
    const user = await authenticateRequest(request)
    
    // Update user data
    const updatedUser = await prisma.users.update({
      where: { uid: user.uid },
      data: {
        username: username || user.username,
        phonenumber: phonenumber || user.phonenumber,
        role: role || user.role,
        type: type || user.type
      }
    })
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    )
  }
}
