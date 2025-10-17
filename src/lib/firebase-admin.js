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
    
    // Remove any potential BOM or invisible characters
    serviceAccountKey = serviceAccountKey.replace(/^\uFEFF/, '')
    
    // Check if the key looks like it might be truncated or malformed
    if (!serviceAccountKey.startsWith('{') || !serviceAccountKey.endsWith('}')) {
      throw new Error('Firebase service account key must be a valid JSON object')
    }
    
    // Check for required fields before parsing
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
  } catch (error) {
    // Silently fallback to Application Default Credentials for production deployments
    try {
      firebaseAdminConfig.credential = applicationDefault()
    } catch (fallbackError) {
      // Initialize without credentials (limited functionality)
      // This allows the app to start even without proper Firebase credentials
    }
  }
} else {
  // No service account key provided, try Application Default Credentials
  try {
    firebaseAdminConfig.credential = applicationDefault()
  } catch (error) {
    // Initialize without credentials (limited functionality)
  }
}

// Initialize Firebase Admin SDK
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export default app
