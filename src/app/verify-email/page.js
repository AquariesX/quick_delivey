'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { applyActionCode, checkActionCode } from 'firebase/auth'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

function VerifyEmailContent() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const oobCode = searchParams.get('oobCode')
        
        if (!oobCode) {
          setStatus('error')
          setMessage('Invalid verification link')
          setError('No verification code found in the URL')
          return
        }

        console.log('Verifying email with oobCode:', oobCode)

        // Check if the action code is valid
        console.log('Checking action code validity...')
        await checkActionCode(auth, oobCode)
        
        // Apply the action code (verify the email)
        console.log('Applying action code...')
        await applyActionCode(auth, oobCode)
        
        console.log('Email verification successful!')
        setStatus('success')
        setMessage('Email verified successfully!')
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
        
      } catch (error) {
        console.error('Email verification error:', error)
        setStatus('error')
        
        switch (error.code) {
          case 'auth/invalid-action-code':
            setMessage('Invalid verification link')
            setError('This verification link is invalid or has expired')
            break
          case 'auth/expired-action-code':
            setMessage('Verification link expired')
            setError('This verification link has expired. Please request a new one')
            break
          case 'auth/user-disabled':
            setMessage('Account disabled')
            setError('This account has been disabled')
            break
          case 'auth/user-not-found':
            setMessage('User not found')
            setError('No user found with this email')
            break
          default:
            setMessage('Verification failed')
            setError(error.message || 'An error occurred during verification')
        }
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-pink-200/30 to-blue-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-8 relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            animate={{
              background: status === 'success' 
                ? ["linear-gradient(45deg, #10b981 0%, #059669 100%)"]
                : status === 'error'
                ? ["linear-gradient(45deg, #ef4444 0%, #dc2626 100%)"]
                : ["linear-gradient(45deg, #3b82f6 0%, #1d4ed8 100%)"]
            }}
            transition={{ duration: 2 }}
            className="absolute inset-0 opacity-10"
          />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100/50 to-blue-100/50 rounded-full blur-2xl" />
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8 relative z-10"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                status === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : status === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
            >
              {status === 'verifying' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-white" />
                </motion.div>
              )}
              {status === 'success' && <CheckCircle className="w-10 h-10 text-white" />}
              {status === 'error' && <XCircle className="w-10 h-10 text-white" />}
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
            <p className="text-gray-600">
              {message}
            </p>
          </motion.div>

          {/* Status Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative z-10"
          >
            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                    Your email has been successfully verified
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                    You can now sign in to your account
                  </p>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    Redirecting to login page...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    {error}
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                    You can request a new verification email from the login page
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Go to Login Page
                </motion.button>
              </div>
            )}

            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                  <p className="text-gray-700 text-sm">
                    Please wait while we verify your email...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
