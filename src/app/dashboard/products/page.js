'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkUserAccess } from '@/lib/authHelpers'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProductManagement from '@/components/ProductManagement'
import VendorProductManagement from '@/components/VendorProductManagement'

export default function ProductManagementPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const access = checkUserAccess(user, userData, ['ADMIN', 'SUPER_ADMIN', 'VENDOR'])
      
      if (!access.hasAccess) {
        router.push(access.redirectTo)
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

  const access = checkUserAccess(user, userData, ['ADMIN', 'SUPER_ADMIN', 'VENDOR'])
  
  if (!access.hasAccess) {
    return null
  }

  const userRole = userData?.role || 'CUSTOMER'

  return (
    <DashboardLayout>
      {userRole === 'VENDOR' ? <VendorProductManagement /> : <ProductManagement />}
    </DashboardLayout>
  )
}
