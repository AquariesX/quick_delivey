'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import VendorManagement from '@/components/VendorManagement'

export default function VendorsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        router.push('/login')
        return
      }
      
      // Check verification status based on user role
      const userRole = userData?.role || 'CUSTOMER'
      const isVerified = userRole === 'VENDOR' ? userData.emailVerification : user.emailVerified
      
      if (!isVerified) {
        router.push('/login')
        return
      }
      
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, router, userData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  const userRole = userData?.role || 'CUSTOMER'
  const isVerified = userRole === 'VENDOR' ? userData.emailVerification : user.emailVerified
  
  if (!isVerified || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <DashboardLayout>
      <VendorManagement />
    </DashboardLayout>
  )
}
