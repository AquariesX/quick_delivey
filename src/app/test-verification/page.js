'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TestVerificationPage() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testVerification = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      // Test the verification API
      const response = await fetch('/api/auth/verify-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: '5869164d79f89b2ae4ad75621b9d03aff27daef556d30fcc1ab51007cbd08ebb',
          email: 'qali13125@gmail.com'
        })
      })

      const result = await response.json()
      setTestResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setTestResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testSetPassword = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      // Test the set password API
      const response = await fetch('/api/auth/set-vendor-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'qali13125@gmail.com',
          password: 'testpassword123',
          username: 'Test User',
          phoneNumber: '1234567890'
        })
      })

      const result = await response.json()
      setTestResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setTestResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Verification Test Page</h1>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testVerification}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Email Verification'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={testSetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Password Setting'}
            </motion.button>
          </div>

          {testResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                {testResult}
              </pre>
            </div>
          )}

          <div className="mt-6 text-center">
            <a 
              href="/verify-vendor?token=5869164d79f89b2ae4ad75621b9d03aff27daef556d30fcc1ab51007cbd08ebb&email=qali13125%40gmail.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Go to Actual Verification Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
