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
      if (!user || !user.emailVerified) {
        router.push('/login')
        return
      }
      
      if (userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN') {
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

  if (!user || !user.emailVerified || (userData?.role !== 'ADMIN' && userData?.role !== 'SUPER_ADMIN')) {
    return null
  }

  return (
    <DashboardLayout>
      <VendorManagement />
    </DashboardLayout>
  )
}
