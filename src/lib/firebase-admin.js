import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import fs from 'fs'
import path from 'path'

// Load environment variables
if (typeof window === 'undefined') {
  // Only load dotenv on server side
  try {
    require('dotenv').config()
  } catch (error) {
    console.log('dotenv not available, using system environment variables')
  }
}

// Firebase Admin configuration
let firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "quick-delivery-fe107"
}

// Check if service account key is available
let serviceAccount = null

// First try to load from environment variable
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    console.log('Firebase Admin SDK initialized with service account key from environment')
  } catch (error) {
    console.error('Error parsing Firebase service account key from environment:', error.message)
  }
}

// If environment variable failed, try to load from file
if (!serviceAccount) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json')
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountData = fs.readFileSync(serviceAccountPath, 'utf8')
      serviceAccount = JSON.parse(serviceAccountData)
      console.log('Firebase Admin SDK initialized with service account key from file')
    }
  } catch (error) {
    console.error('Error loading Firebase service account key from file:', error.message)
  }
}

// Apply service account credentials if available
if (serviceAccount) {
  firebaseAdminConfig = {
    ...firebaseAdminConfig,
    credential: cert(serviceAccount)
  }
} else {
  console.log('No Firebase service account key found, using default credentials')
}

// Initialize Firebase Admin SDK
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export default app