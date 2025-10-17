import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT_SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT_SET',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT_SET',
      FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'SET' : 'NOT_SET'
    }

    return NextResponse.json({
      success: true,
      message: 'Vercel deployment test',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      region: process.env.VERCEL_REGION || 'unknown'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
