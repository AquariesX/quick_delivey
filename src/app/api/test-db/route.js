import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test database connection
    const testUser = await prisma.users.findFirst()
    console.log('Database test result:', testUser)
    
    return Response.json({ 
      success: true, 
      message: 'Database connection successful',
      testUser 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
