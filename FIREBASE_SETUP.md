# Firebase Service Account Setup

## Email Verification System Setup

The email verification system has been fixed and optimized for both development and production environments.

### 🚀 Production Deployment (Vercel)

For production deployment on Vercel, you need to configure environment variables in your Vercel dashboard:

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project: `quick-delivey`
   - Go to Settings → Environment Variables

2. **Add Required Environment Variables**:
   ```
   FIREBASE_PROJECT_ID=quick-delivery-fe107
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6Zwg3QRf2qmsv56WHdqI5MbnX6owH1ZY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quick-delivery-fe107.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quick-delivery-fe107.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=582139435085
   NEXT_PUBLIC_FIREBASE_APP_ID=1:582139435085:web:5da529a1a4d7fc6e326404
   DATABASE_URL=your_database_connection_string
   ```

3. **Optional: Firebase Service Account Key** (for enhanced functionality):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `quick-delivery-fe107`
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Copy the entire JSON content
   - Add as environment variable: `FIREBASE_SERVICE_ACCOUNT_KEY` (paste the entire JSON as one line)

### 💻 Local Development Setup

1. **Create Firebase Service Account Key**:
   - Download the service account JSON file from Firebase Console
   - Rename it to `firebase-service-account.json`
   - Place it in the root directory of your project

2. **Environment Variables**:
   Make sure your `.env` file contains:
   ```
   FIREBASE_PROJECT_ID=quick-delivery-fe107
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA6Zwg3QRf2qmsv56WHdqI5MbnX6owH1ZY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=quick-delivery-fe107.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=quick-delivery-fe107.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=582139435085
   NEXT_PUBLIC_FIREBASE_APP_ID=1:582139435085:web:5da529a1a4d7fc6e326404
   DATABASE_URL=your_database_connection_string
   ```

### 🔧 What Was Fixed

- ✅ Firebase Admin SDK configuration with fallback mechanisms
- ✅ Email verification API endpoint using Firebase REST API
- ✅ Enhanced error handling and detailed logging
- ✅ Production-ready service account key loading
- ✅ Environment variable configuration for both dev and production
- ✅ Comprehensive debugging and troubleshooting

### 🔒 Security Notes

- The `firebase-service-account.json` file is excluded from git commits
- Service account keys should be stored as environment variables in production
- Never commit sensitive credentials to version control

### 🧪 Testing the Verification System

1. **Register a new user account**
2. **Check email for verification link**
3. **Click the verification link**
4. **Should see success message and redirect to login**

### 🐛 Troubleshooting

If verification still fails:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Functions → View Function Logs
   - Look for error messages in the verification API

2. **Verify Environment Variables**:
   - Ensure all required environment variables are set in Vercel
   - Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct

3. **Test Firebase API Key**:
   - The API key should work with Firebase REST API
   - Verify it's not expired or restricted

4. **Database Connection**:
   - Ensure `DATABASE_URL` is correctly configured
   - Check that Prisma can connect to your database

### 📋 Current Status

The verification system now works with:
- ✅ Firebase REST API (no service account required)
- ✅ Enhanced error handling and logging
- ✅ Production-ready configuration
- ✅ Fallback mechanisms for different environments
