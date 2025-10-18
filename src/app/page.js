'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user && userData) {
        // Check verification status based on user role
        const userRole = userData?.role || 'CUSTOMER'
        const isVerified = userRole === 'VENDOR' ? userData.emailVerification : user.emailVerified
        
        if (isVerified) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } else {
        router.push('/login')
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

  return null
}