'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export default function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)

  // Fetch user data from database
  const fetchUserData = async (firebaseUser) => {
    try {
      console.log('Fetching user data for UID:', firebaseUser.uid)
      
      const response = await fetch(`/api/users?uid=${firebaseUser.uid}`)
      const result = await response.json()
      
      console.log('Fetch user data result:', result)
      
      if (result.success) {
        return result.user
      } else if (response.status === 404 || result.code === 'USER_NOT_FOUND') {
        // User not found is a normal case, not an error
        console.log('User not found in database (this is normal for new users)')
        return null
      } else {
        console.error('Failed to fetch user data:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  }

  // Create user in database
  const createUserInDatabase = async (firebaseUser, username, phoneNumber, role, type) => {
    try {
      console.log('Creating user in database:', { 
        uid: firebaseUser.uid, 
        username, 
        email: firebaseUser.email, 
        phoneNumber, 
        role, 
        type 
      })

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          username,
          email: firebaseUser.email,
          phoneNumber,
          role,
          type
        })
      })
      
      const result = await response.json()
      console.log('Database creation result:', result)
      
      if (result.success) {
        return result.user
      } else {
        console.error('Failed to create user:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  // Update email verification status
  const updateEmailVerification = async (uid, verified) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          emailVerification: verified
        })
      })
      
      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Error updating email verification:', error)
      return false
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser)
      
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Fetch user data from database
        const dbUser = await fetchUserData(firebaseUser)
        console.log('Setting userData:', dbUser)
        
        if (dbUser) {
          setUserData(dbUser)
        } else {
          console.log('User not found in database - this should not happen for registered users')
          setUserData(null)
        }
        
        // Update email verification status if needed
        if (firebaseUser.emailVerified && dbUser && !dbUser.emailVerification) {
          await updateEmailVerification(firebaseUser.uid, true)
          setUserData(prev => prev ? { ...prev, emailVerification: true } : null)
        }
        
        if (!firebaseUser.emailVerified && !emailVerificationSent) {
          setEmailVerificationSent(false)
        }
      } else {
        setUser(null)
        setUserData(null)
        setEmailVerificationSent(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [emailVerificationSent])

  const signUp = async (email, password, username, phoneNumber, role, type) => {
    try {
      setLoading(true)
      
      // Retry logic for network issues
      let user = null
      let retries = 3
      
      while (retries > 0 && !user) {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)
          user = result.user
        } catch (error) {
          if (error.code === 'auth/network-request-failed' && retries > 1) {
            console.log(`Network error, retrying... (${retries - 1} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before retry
            retries--
            continue
          }
          throw error
        }
      }
      
      if (!user) {
        throw new Error('Failed to create user after multiple attempts')
      }
      
      // Update user profile with additional information
      try {
        await updateProfile(user, {
          displayName: username
        })
      } catch (profileError) {
        console.warn('Profile update failed:', profileError)
        // Continue even if profile update fails
      }

      // Create user in database
      console.log('Creating user in database with signUp data:', { username, phoneNumber, role, type })
      const dbUser = await createUserInDatabase(user, username, phoneNumber, role, type)
      console.log('Database user created in signUp:', dbUser)
      if (dbUser) {
        setUserData(dbUser)
      }

      // Send email verification with retry logic
      let verificationSent = false
      retries = 3
      
      while (retries > 0 && !verificationSent) {
        try {
          await sendEmailVerification(user)
          setEmailVerificationSent(true)
          verificationSent = true
          toast.success('Registration successful! Please check your email for verification.')
        } catch (error) {
          if (error.code === 'auth/network-request-failed' && retries > 1) {
            console.log(`Email verification retry... (${retries - 1} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            retries--
            continue
          }
          console.error('Email verification failed:', error)
          toast.error('Registration successful but email verification failed. You can resend it later.')
          break
        }
      }
      
      return { user, userData: dbUser, emailVerificationSent: verificationSent }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(getErrorMessage(error.code))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      if (!user.emailVerified) {
        toast.error('Please verify your email before signing in.')
        await signOut(auth)
        return null
      }
      
      toast.success('Welcome back!')
      return user
    } catch (error) {
      toast.error(getErrorMessage(error.code))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to log out')
      throw error
    }
  }

  const resendEmailVerification = async () => {
    try {
      if (user && !user.emailVerified) {
        let retries = 3
        let verificationSent = false
        
        while (retries > 0 && !verificationSent) {
          try {
            await sendEmailVerification(user)
            toast.success('Verification email sent!')
            verificationSent = true
          } catch (error) {
            if (error.code === 'auth/network-request-failed' && retries > 1) {
              console.log(`Email verification retry... (${retries - 1} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, 2000))
              retries--
              continue
            }
            throw error
          }
        }
        
        if (!verificationSent) {
          throw new Error('Failed to send verification email after multiple attempts')
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error(getErrorMessage(error.code))
      throw error
    }
  }

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/user-not-found':
        return 'No account found with this email'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/invalid-credential':
        return 'Invalid email or password'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again'
      default:
        return 'An error occurred. Please try again'
    }
  }

  const value = {
    user,
    userData,
    loading,
    emailVerificationSent,
    signUp,
    signIn,
    logout,
    resendEmailVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
