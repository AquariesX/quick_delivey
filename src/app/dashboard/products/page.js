'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductManagement from '@/components/ProductManagement'
import VendorProductManagement from '@/components/VendorProductManagement'

export default function ProductManagementPage() {
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

      // Check if user has access to product management
      const canAccess = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'VENDOR'
      
      if (!canAccess) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  const userRole = userData?.role || 'CUSTOMER'
  const isVerified = userRole === 'VENDOR' ? userData.emailVerification : user.emailVerified
  const canAccess = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'VENDOR'
  
  if (!isVerified || !canAccess) {
    return null
  }

  return (
    <DashboardLayout>
      {userRole === 'VENDOR' ? <VendorProductManagement /> : <ProductManagement />}
    </DashboardLayout>
  )
}
