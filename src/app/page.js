'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function HomeContent() {
  const { user, loading } = useAuth()
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
      if (user && user.emailVerified) {
        // Check user role and redirect accordingly
        // For now, we'll redirect to customer dashboard by default
        // In a real app, you'd check the user's role from the database
        router.push('/customer')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router, searchParams])

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