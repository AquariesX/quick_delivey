'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react'

function EmailVerificationContent() {
  const [step, setStep] = useState('verifying') // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const oobCode = searchParams.get('oobCode')
  const mode = searchParams.get('mode')

  const verifyEmail = useCallback(async () => {
    try {
      setLoading(true)
      setStep('verifying')
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oobCode })
      })

      const result = await response.json()
      
      if (result.success) {
        setStep('success')
        setMessage(result.message)
        setUserInfo(result.user)
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setStep('error')
        setMessage(result.error || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStep('error')
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [oobCode])

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      verifyEmail()
    } else {
      setStep('error')
      setMessage('Invalid verification link. Missing required parameters.')
    }
  }, [oobCode, mode, verifyEmail])

  const renderVerifyingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Your Email</h2>
      <p className="text-gray-600 mb-8">Please wait while we verify your email address...</p>
    </motion.div>
  )

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified!</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <p className="text-sm text-blue-600 mb-6">
        You will be automatically redirected to the login page in a few seconds...
      </p>
      
      {userInfo && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Welcome, {userInfo.username}!</strong><br />
            Role: {userInfo.role}<br />
            Email: {userInfo.email}
          </p>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/login')}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Continue to Login
      </motion.button>
    </motion.div>
  )

  const renderErrorStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go to Login
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/register')}
          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Register Again
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Email Verification</h1>
            <p className="text-gray-600 mt-2">Quick Delivery System</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'verifying' && renderVerifyingStep()}
            {step === 'success' && renderSuccessStep()}
            {step === 'error' && renderErrorStep()}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
              <p className="text-gray-600">Please wait while we prepare the verification page.</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  )
}
