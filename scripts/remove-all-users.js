import { prisma } from '@/lib/prisma'

async function removeAllUsers() {
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
      console.log('No users found to remove.')
      return
    }
    
    // Remove all users
    const deleteResult = await prisma.users.deleteMany({})
    
    console.log(`Successfully removed ${deleteResult.count} users.`)
    
    // Verify all users are removed
    const remainingUsers = await prisma.users.findMany()
    console.log(`Remaining users: ${remainingUsers.length}`)
    
    if (remainingUsers.length === 0) {
      console.log('✅ All users have been successfully removed!')
    } else {
      console.log('⚠️ Some users still remain:', remainingUsers)
    }
    
  } catch (error) {
    console.error('Error removing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
removeAllUsers()
