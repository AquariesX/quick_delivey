'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserRole } from '@/lib/authHelpers'

function HomeContent() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if this is a Firebase verification link
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')
    
    if (mode === 'verifyEmail' && oobCode) {
      console.log('Firebase verification link detected, redirecting to verification page')
      // Redirect to verification page with all parameters
      const currentUrl = new URL(window.location.href)
      router.push(`/verify?${currentUrl.searchParams.toString()}`)
      return
    }

    if (!loading) {
      console.log('🏠 Home page - Auth state:', { 
        user: !!user, 
        emailVerified: user?.emailVerified, 
        userData: !!userData,
        userDataRole: userData?.role,
        loading 
      })
      
      if (user && user.emailVerified) {
        // Check user role and redirect accordingly
        if (userData) {
          const userRole = getUserRole(userData)
          console.log('🎯 Home page - User role detected:', userRole)
          console.log('📊 Home page - Full userData:', userData)
          
          if (userRole === 'ADMIN') {
            console.log('🚀 Redirecting admin to dashboard')
            router.push('/dashboard')
          } else if (userRole === 'VENDOR') {
            console.log('🚀 Redirecting vendor to vendor dashboard')
            router.push('/vendor-dashboard')
          } else if (userRole === 'CUSTOMER') {
            console.log('🚀 Redirecting customer to customer dashboard')
            router.push('/customer')
          } else {
            console.log('❓ Unknown role, redirecting to login')
            router.push('/login')
          }
        } else {
          console.log('⏳ UserData not loaded yet, waiting...')
          // Don't redirect immediately, wait for userData to load
        }
      } else {
        console.log('🔐 No user or not verified, redirecting to login')
        router.push('/login')
      }
    }
  }, [user, userData, loading, router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return null
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}