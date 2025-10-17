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
  const [userDataLoadingTimeout, setUserDataLoadingTimeout] = useState(false)

  // Fetch user data from database
  const fetchUserData = async (firebaseUser) => {
    try {
      const response = await fetch(`/api/users?uid=${firebaseUser.uid}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // User not found is normal for new users
          return null
        }
        console.error('Failed to fetch user data:', response.status, response.statusText)
        return null
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.user
      } else if (result.code === 'USER_NOT_FOUND') {
        return null
      } else {
        console.error('Failed to fetch user data:', result.error)
        return null
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message)
      return null
    }
  }

  // Create user in database
  const createUserInDatabase = async (firebaseUser, username, phoneNumber, role, type) => {
    try {
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
      
      if (result.success) {
        return result.user
      } else {
        console.error('Failed to create user:', result.error)
        
        // If it's a duplicate user error, try to fetch the existing user
        if (result.code === 'USER_ALREADY_EXISTS' || result.error.includes('already exists')) {
          const existingUser = await fetchUserData(firebaseUser)
          if (existingUser) {
            return existingUser
          }
        }
        
        return null
      }
    } catch (error) {
      console.error('Error creating user:', error.message)
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
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Set a timeout for user data loading
        const userDataTimeout = setTimeout(() => {
          setUserDataLoadingTimeout(true)
        }, 10000) // 10 second timeout
        
        try {
          // Fetch user data from database with retry logic
          let dbUser = null
          let fetchRetries = 3
          
          while (fetchRetries > 0 && !dbUser) {
            try {
              dbUser = await fetchUserData(firebaseUser)
              if (dbUser) {
                setUserData(dbUser)
                break
              }
            } catch (fetchError) {
              if (fetchRetries > 1) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                fetchRetries--
                continue
              }
              throw fetchError
            }
          }
          
          clearTimeout(userDataTimeout)
          
          if (!dbUser) {
            // Try to create the user in the database as a fallback
            try {
              const fallbackUser = await createUserInDatabase(
                firebaseUser, 
                firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                firebaseUser.phoneNumber || '',
                'CUSTOMER', // Default role
                'firebase'
              )
              
              if (fallbackUser) {
                setUserData(fallbackUser)
              } else {
                // Try to fetch the user again in case it was created but not returned
                setTimeout(async () => {
                  try {
                    const retryUser = await fetchUserData(firebaseUser)
                    if (retryUser) {
                      setUserData(retryUser)
                    } else {
                      setUserData(null)
                    }
                  } catch (retryError) {
                    console.error('Error on retry fetch:', retryError)
                    setUserData(null)
                  }
                }, 2000) // Wait 2 seconds before retry
              }
            } catch (error) {
              console.error('Error creating fallback user:', error.message)
              setUserData(null)
            }
          }
          
          // Update email verification status if needed
          if (firebaseUser.emailVerified && dbUser && !dbUser.emailVerification) {
            await updateEmailVerification(firebaseUser.uid, true)
            setUserData(prev => prev ? { ...prev, emailVerification: true } : null)
          }
          
          if (!firebaseUser.emailVerified && !emailVerificationSent) {
            setEmailVerificationSent(false)
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error.message)
          clearTimeout(userDataTimeout)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
        setEmailVerificationSent(false)
        setUserDataLoadingTimeout(false)
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

      // Create user in database with retry logic
      let dbUser = null
      let dbRetries = 3
      
      while (dbRetries > 0 && !dbUser) {
        try {
          dbUser = await createUserInDatabase(user, username, phoneNumber, role, type)
          
          if (dbUser) {
            setUserData(dbUser)
            break
          }
        } catch (dbError) {
          if (dbRetries > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
            dbRetries--
            continue
          }
          throw dbError
        }
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
            await new Promise(resolve => setTimeout(resolve, 2000))
            retries--
            continue
          }
          console.error('Email verification failed:', error.message)
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
      
      // First, check if this is a vendor who needs to set their password
      try {
        const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.user && result.user.role === 'VENDOR') {
            // Check if vendor has set their password (has Firebase UID)
            if (!result.user.uid || result.user.uid.startsWith('temp_')) {
              toast.error('Please complete your account setup by setting your password first.')
              return null
            }
          }
        }
      } catch (dbError) {
        console.error('Error checking user status:', dbError)
      }
      
      // Proceed with Firebase authentication
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      
      // For vendors, check database verification status instead of Firebase verification
      if (user.emailVerified) {
        // Firebase user is verified, proceed normally
        toast.success('Welcome back!')
        return user
      } else {
        // Firebase user is not verified, check if it's a vendor with database verification
        try {
          const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.user && result.user.role === 'VENDOR' && result.user.emailVerification) {
              // Vendor is verified in database, allow login
              console.log('Vendor verified in database, allowing login')
              toast.success('Welcome back!')
              return user
            }
          }
        } catch (dbError) {
          console.error('Error checking database verification:', dbError)
        }
        
        // Not a verified vendor, require Firebase email verification
        toast.error('Please verify your email before signing in.')
        await signOut(auth)
        return null
      }
    } catch (error) {
      console.error('Sign in error:', error)
      
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-credential') {
        // Check if this is a vendor who hasn't set their password yet
        try {
          const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.user && result.user.role === 'VENDOR' && result.user.emailVerification) {
              if (!result.user.uid || result.user.uid.startsWith('temp_')) {
                toast.error('Please complete your account setup by setting your password first.')
                return null
              }
            }
          }
        } catch (dbError) {
          console.error('Error checking user status:', dbError)
        }
        
        toast.error('Invalid email or password. Please check your credentials.')
      } else {
        toast.error(getErrorMessage(error.code))
      }
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
      console.error('Resend verification error:', error.message)
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
    userDataLoadingTimeout,
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
