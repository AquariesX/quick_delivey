'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userDataLoadingTimeout, setUserDataLoadingTimeout] = useState(false)

  const loadUserData = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/users?uid=${user.uid}`)
      const result = await response.json()
      
      if (result.success) {
        setUserData(result.user)
        setUserDataLoadingTimeout(false)
      } else {
        console.warn('Failed to load user data:', result.error)
        setUserDataLoadingTimeout(true)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setUserDataLoadingTimeout(true)
    }
  }, [user])

  // Load user data from database when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setUserData(null)
      setUserDataLoadingTimeout(false)
    }
  }, [user, loadUserData])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email, password, displayName, phoneNumber = '', role = 'CUSTOMER', type = 'user') => {
    try {
      setLoading(true)
      
      // Create user with Firebase
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      await updateProfile(firebaseUser, { displayName })
      
      // Send email verification
      await sendEmailVerification(firebaseUser)
      
      // Create user in database
      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            username: displayName,
            email: firebaseUser.email,
            phoneNumber,
            role,
            type
          })
        })
        
        const result = await response.json()
        if (!result.success) {
          console.warn('Database user creation failed, but Firebase user created:', result.error)
          // Continue with Firebase user creation even if database fails
        }
      } catch (dbError) {
        console.warn('Database error during user creation, but Firebase user created:', dbError.message)
        // Continue with Firebase user creation even if database fails
      }
      
      toast.success('Account created! Please check your email to verify your account.')
      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(getErrorMessage(error.code))
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      
      // Check if email is verified in Firebase
      if (!firebaseUser.emailVerified) {
        // Fallback: Check database verification status
        try {
          const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
          const result = await response.json()
          
          if (result.success && result.user?.emailVerification) {
            console.log('Email verified in database, allowing login')
            toast.success('Welcome back!')
            return { success: true, user: firebaseUser }
          }
        } catch (dbError) {
          console.warn('Failed to check database verification status:', dbError.message)
        }
        
        await signOut(auth)
        toast.error('Please verify your email before signing in.')
        return { success: false, error: 'Email not verified' }
      }
      
      toast.success('Welcome back!')
      return { success: true, user: firebaseUser }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(getErrorMessage(error.code))
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to log out')
    }
  }

  const resendVerification = async () => {
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user)
          toast.success('Verification email sent!')
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast.error('Failed to send verification email')
    }
  }

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered'
      case 'auth/invalid-email':
        return 'Invalid email address'
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
      default:
        return 'An error occurred. Please try again'
    }
  }

  const value = {
    user,
    userData,
    loading,
    userDataLoadingTimeout,
    signUp,
    signIn,
    logout,
    resendVerification,
    loadUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
