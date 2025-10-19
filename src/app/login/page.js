'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { getUserRole } from '@/lib/authHelpers'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn, user, userData, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  // DISABLED: Automatic redirection - only redirect after manual login
  // useEffect(() => {
  //   console.log('Login page useEffect triggered:', { authLoading, user: !!user, userData: !!userData })
  //   
  //   if (!authLoading && user && userData) {
  //     const userRole = getUserRole(userData)
  //     console.log('User role detected:', userRole)
  //     console.log('User data:', userData)
  //     
  //     // Only redirect if we have a confirmed role
  //     if (userRole === 'ADMIN') {
  //       console.log('Redirecting admin to dashboard')
  //       router.push('/dashboard')
  //     } else if (userRole === 'VENDOR') {
  //       console.log('Redirecting vendor to vendor dashboard')
  //       router.push('/vendor-dashboard')
  //     } else if (userRole === 'CUSTOMER') {
  //       console.log('Redirecting customer to customer page')
  //       router.push('/customer')
  //     }
  //     // Don't redirect if role is unknown - let user stay on login page
  //   }
  // }, [user, userData, authLoading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔐 Attempting login for:', email)
      const result = await signIn(email, password)
      console.log('📡 Login result:', result)
      
      if (result.success) {
        console.log('✅ Login successful, waiting for userData to load...')
        
        // Wait for userData to be available, then redirect
        const checkUserData = () => {
          console.log('🔍 Checking userData:', { userData: !!userData, userDataContent: userData })
          
          if (userData) {
            const userRole = getUserRole(userData)
            console.log('🎯 UserData loaded, role:', userRole)
            console.log('📊 Full userData:', userData)
            
            if (userRole === 'ADMIN') {
              console.log('🚀 Redirecting admin to dashboard')
              router.push('/dashboard')
            } else if (userRole === 'VENDOR') {
              console.log('🚀 Redirecting vendor to vendor dashboard')
              router.push('/vendor-dashboard')
            } else if (userRole === 'CUSTOMER') {
              console.log('🚀 Redirecting customer to customer page')
              router.push('/customer')
            } else {
              console.log('❓ Unknown role, staying on login page')
            }
          } else {
            console.log('⏳ UserData not loaded yet, retrying...')
            setTimeout(checkUserData, 500)
          }
        }
        
        // Start checking for userData
        setTimeout(checkUserData, 1000)
      } else {
        console.error('❌ Login failed:', result.error)
      }
    } catch (error) {
      console.error('❌ Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Quick Delivery account</p>
            
            {/* Logout Button for Testing */}
            {user && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 mb-2">Already logged in as: {user.email}</p>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Logout to test login flow
                </button>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up here
              </button>
            </p>
            
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}