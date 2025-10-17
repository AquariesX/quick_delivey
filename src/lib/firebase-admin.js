import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "quick-delivery-fe107"
}

// Add credential only if service account key is provided
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    firebaseAdminConfig.credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  } catch (error) {
    console.error('Error parsing Firebase service account key:', error)
  }
}

// Initialize Firebase Admin SDK
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export default app
