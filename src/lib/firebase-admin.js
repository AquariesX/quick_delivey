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
    
    // Debug: Log the first 50 characters to help identify the issue
    console.log('Firebase service account key preview:', serviceAccountKey.substring(0, 50) + '...')
    
    // Handle common formatting issues
    // Replace single quotes with double quotes (common mistake)
    serviceAccountKey = serviceAccountKey.replace(/'/g, '"')
    
    // Check if the key looks like it might be truncated
    if (!serviceAccountKey.includes('"type"') || !serviceAccountKey.includes('"project_id"')) {
      throw new Error('Firebase service account key appears to be incomplete or malformed')
    }
    
    // Parse the JSON
    const parsedKey = JSON.parse(serviceAccountKey)
    
    // Validate that it has required fields
    if (!parsedKey.type || !parsedKey.project_id || !parsedKey.private_key) {
      throw new Error('Invalid service account key: missing required fields (type, project_id, or private_key)')
    }
    
    firebaseAdminConfig.credential = cert(parsedKey)
    console.log('Firebase Admin SDK initialized with service account key')
  } catch (error) {
    console.error('Error parsing Firebase service account key:', error.message)
    console.log('The service account key appears to be malformed or incomplete.')
    console.log('Please check your environment variable FIREBASE_SERVICE_ACCOUNT_KEY.')
    console.log('Attempting to use Application Default Credentials instead...')
    
    // Fallback to Application Default Credentials (useful for production deployments)
    try {
      firebaseAdminConfig.credential = applicationDefault()
      console.log('Firebase Admin SDK initialized with Application Default Credentials')
    } catch (fallbackError) {
      console.error('Failed to initialize with Application Default Credentials:', fallbackError.message)
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
