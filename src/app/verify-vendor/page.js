'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail, User, Phone, ArrowRight } from 'lucide-react'

function VerifyVendorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('verifying') // verifying, email-verified, success, error
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: ''
  })
  
  const [userData, setUserData] = useState(null)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    console.log('Vendor verification page loaded with params:', { token: token ? 'present' : 'missing', email: email ? 'present' : 'missing' })
    
    if (!token || !email) {
      console.log('Missing token or email parameters')
      setError('Invalid verification link - missing required parameters')
      setStep('error')
      return
    }

    // Decode URL-encoded email
    const decodedEmail = decodeURIComponent(email)
    console.log('Decoded email:', decodedEmail)
    
    verifyEmail()
  }, [token, email])

  const verifyEmail = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Starting email verification with:', { token, email })
      
      // Decode URL-encoded email
      const decodedEmail = decodeURIComponent(email)
      
      const response = await fetch('/api/auth/verify-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email: decodedEmail })
      })

      console.log('API response status:', response.status)
      const result = await response.json()
      console.log('API response result:', result)

      if (result.success) {
        console.log('Email verification successful!')
        setUserData(result.user)
        setFormData(prev => ({
          ...prev,
          username: result.user.username,
          email: result.user.email,
          phoneNumber: result.user.phoneNumber
        }))
        setStep('success')
        setSuccess('Email verified successfully! Your vendor account is now active.')
      } else {
        console.error('Email verification failed:', result.error)
        setError(result.error || 'Invalid or expired verification link')
        setStep('error')
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setError('Failed to verify email. Please try again.')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }, [token, email])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderVerifyingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Your Email</h2>
      <p className="text-gray-600 mb-6">Please wait while we verify your email address...</p>
    </motion.div>
  )

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Verified!</h2>
      <p className="text-gray-600 mb-4">Your vendor account has been successfully verified and is now active.</p>
      <p className="text-sm text-gray-500 mb-6">You can now login to your vendor dashboard using your email and the password that was generated for you.</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/login')}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <ArrowRight className="w-4 h-4" />
        Go to Login
      </motion.button>
    </motion.div>
  )

  const renderErrorStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/login')}
        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
      >
        <ArrowRight className="w-4 h-4" />
        Go to Login
      </motion.button>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'verifying' && renderVerifyingStep()}
          {step === 'success' && renderSuccessStep()}
          {error && step === 'error' && renderErrorStep()}
        </div>
      </div>
    </div>
  )
}

export default function VerifyVendorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyVendorContent />
    </Suspense>
  )
}