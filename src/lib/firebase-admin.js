import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "quick-delivery-fe107"
}

// Add credential only if service account key is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    // Clean and validate the JSON string
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim()
    
    // Handle common formatting issues
    // Replace single quotes with double quotes (common mistake)
    serviceAccountKey = serviceAccountKey.replace(/'/g, '"')
    
    // Parse the JSON
    const parsedKey = JSON.parse(serviceAccountKey)
    
    // Validate that it has required fields
    if (!parsedKey.type || !parsedKey.project_id || !parsedKey.private_key) {
      throw new Error('Invalid service account key: missing required fields')
    }
    
    firebaseAdminConfig.credential = cert(parsedKey)
    console.log('Firebase Admin SDK initialized with service account key')
  } catch (error) {
    console.error('Error parsing Firebase service account key:', error)
    console.log('Attempting to use Application Default Credentials instead...')
    
    // Fallback to Application Default Credentials (useful for production deployments)
    try {
      firebaseAdminConfig.credential = applicationDefault()
      console.log('Firebase Admin SDK initialized with Application Default Credentials')
    } catch (fallbackError) {
      console.error('Failed to initialize with Application Default Credentials:', fallbackError)
      console.log('Firebase Admin SDK will be initialized without credentials (limited functionality)')
    }
  }
} else {
  console.log('No FIREBASE_SERVICE_ACCOUNT_KEY provided, attempting to use Application Default Credentials...')
  try {
    firebaseAdminConfig.credential = applicationDefault()
    console.log('Firebase Admin SDK initialized with Application Default Credentials')
  } catch (error) {
    console.log('Application Default Credentials not available, initializing without credentials')
  }
}

// Initialize Firebase Admin SDK
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export default app
