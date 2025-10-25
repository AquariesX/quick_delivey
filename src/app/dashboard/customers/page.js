'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { checkUserAccess, getUserRole } from '@/lib/authHelpers'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerManagement from '@/components/admin/CustomerManagement'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const CustomersPage = () => {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      const access = checkUserAccess(user, userData, ['ADMIN'])
      
      if (!access.hasAccess) {
        const userRole = getUserRole(userData)
        
        if (userRole === 'CUSTOMER') {
          router.push('/customer')
        } else if (userRole === 'VENDOR') {
          router.push('/vendor-dashboard')
        } else {
          router.push(access.redirectTo)
        }
        return
      }
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Loading Customer Management...
          </motion.h2>
          <p className="text-gray-600">Preparing your admin panel</p>
        </motion.div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <CustomerManagement />
    </DashboardLayout>
  )
}

export default CustomersPage
