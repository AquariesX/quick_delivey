import { prisma } from '@/lib/prisma'

async function removeTestUsers() {
  try {
    console.log('Starting to remove test users...')
    
    // Find all users
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('Found users:', allUsers)
    
    // Define test user patterns
    const testPatterns = [
      'test',
      'demo',
      'example',
      'qasim', // Based on the terminal logs
      'qali'   // Based on the terminal logs
    ]
    
    // Find users that match test patterns
    const testUsers = allUsers.filter(user => 
      testPatterns.some(pattern => 
        user.email.toLowerCase().includes(pattern) ||
        user.username.toLowerCase().includes(pattern)
      )
    )
    
    console.log('Test users to remove:', testUsers)
    
    if (testUsers.length === 0) {
      console.log('No test users found to remove.')
      return
    }
    
    // Remove test users
    const deleteResult = await prisma.users.deleteMany({
      where: {
        id: {
          in: testUsers.map(user => user.id)
        }
      }
    })
    
    console.log(`Successfully removed ${deleteResult.count} test users.`)
    
    // Show remaining users
    const remainingUsers = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log('Remaining users:', remainingUsers)
    
  } catch (error) {
    console.error('Error removing test users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
removeTestUsers()
