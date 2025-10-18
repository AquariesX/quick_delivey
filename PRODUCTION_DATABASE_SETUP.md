# Production Database Setup Guide

## Quick Setup Options for Vercel Deployment

### Option 1: PlanetScale (Recommended - Free)
1. Go to https://planetscale.com
2. Sign up for free account
3. Create new database: "quick-delivery"
4. Get connection string from dashboard
5. Update .env file with new DATABASE_URL

### Option 2: Railway (Free MySQL)
1. Go to https://railway.app
2. Sign up and create new project
3. Add MySQL database
4. Get connection string
5. Update .env file

### Option 3: Supabase (Free PostgreSQL)
1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Update schema to PostgreSQL

## Current Issue
Your current DATABASE_URL points to: 46.17.175.1:3306
This server is not accessible, causing connection errors.

## Next Steps
1. Choose one of the above options
2. Get your new DATABASE_URL
3. Update your .env file
4. Run: npx prisma db push
5. Deploy to Vercel

## Environment Variables for Vercel
Make sure to add these to your Vercel project settings:
- DATABASE_URL
- FIREBASE_PROJECT_ID
- FIREBASE_SERVICE_ACCOUNT_KEY
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
