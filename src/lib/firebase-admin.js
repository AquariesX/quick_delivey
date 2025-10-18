import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Firebase Admin configuration
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "quick-delivery-fe107"
}

// Initialize Firebase Admin SDK with default credentials
// Firebase will automatically use Application Default Credentials (ADC)
// or environment variables if available

// Initialize Firebase Admin SDK
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export default app