import { prisma } from '@/lib/prisma'

export async function DELETE(request) {
  try {
    console.log('Starting to remove all users...')
    
    // First, let's see what users exist
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('Found users to remove:', allUsers)
    console.log(`Total users found: ${allUsers.length}`)
    
    if (allUsers.length === 0) {
      return Response.json({
        success: true,
        message: 'No users found to remove.',
        removedCount: 0
      })
    }
    
    // Remove all users
    const deleteResult = await prisma.users.deleteMany({})
    
    console.log(`Successfully removed ${deleteResult.count} users.`)
    
    // Verify all users are removed
    const remainingUsers = await prisma.users.findMany()
    console.log(`Remaining users: ${remainingUsers.length}`)
    
    return Response.json({
      success: true,
      message: `Successfully removed ${deleteResult.count} users.`,
      removedCount: deleteResult.count,
      remainingUsers: remainingUsers.length
    })
    
  } catch (error) {
    console.error('Error removing users:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
