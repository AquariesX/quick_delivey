import { testEmailConfig } from '@/lib/testEmail'

export async function GET() {
  try {
    const result = await testEmailConfig()
    return Response.json(result)
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
