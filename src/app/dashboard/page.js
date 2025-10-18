'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkUserVerification } from '@/lib/authHelpers'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const { user, userData, loading, userDataLoadingTimeout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const verification = checkUserVerification(user, userData)
      
      if (!verification.isVerified) {
        router.push('/login')
        return
      }
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const verification = checkUserVerification(user, userData)
  
  if (!verification.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {userDataLoadingTimeout ? 'Account setup in progress...' : 'Loading user data...'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {userDataLoadingTimeout 
              ? 'We are setting up your account. This may take a few moments.'
              : 'If this takes too long, there might be an issue with your account setup.'
            }
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => router.push('/login')} 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  )
}
