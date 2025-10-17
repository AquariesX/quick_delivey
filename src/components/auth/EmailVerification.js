'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'

const EmailVerification = () => {
  const { user, resendEmailVerification } = useAuth()

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification()
    } catch (error) {
      console.error('Resend verification error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-8 relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div
          animate={{
            background: [
              "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
              "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)",
              "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 opacity-10"
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/50 to-red-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/50 to-cyan-100/50 rounded-full blur-2xl" />
        
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
            className="w-20 h-20 bg-gradient-to-r from-pink-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We&apos;ve sent a verification link to
          </p>
          <p className="text-blue-600 font-semibold mt-1">
            {user?.email}
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4 relative z-10"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Check your email inbox for a verification link
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Click the link to verify your account
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Return here to sign in after verification
            </p>
          </div>
        </motion.div>

        {/* Resend Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 relative z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResendVerification}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Resend Verification Email</span>
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 text-center relative z-10"
        >
          <p className="text-gray-500 text-xs">
            Didn&apos;t receive the email? Check your spam folder or try resending.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default EmailVerification
