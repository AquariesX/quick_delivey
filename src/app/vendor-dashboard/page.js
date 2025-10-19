'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { checkUserAccess } from '@/lib/authHelpers'
import DashboardLayout from '@/components/layout/DashboardLayout'
import VendorProductManagement from '@/components/VendorProductManagement'

export default function VendorDashboardPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const access = checkUserAccess(user, userData, ['VENDOR'])
      
      if (!access.hasAccess) {
        router.push(access.redirectTo)
        return
      }
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600">Manage your products and orders</p>
        </div>
        
        <VendorProductManagement />
      </div>
    </DashboardLayout>
  )
}
