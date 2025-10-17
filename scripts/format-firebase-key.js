#!/usr/bin/env node

/**
 * Helper script to format Firebase service account key for environment variables
 * 
 * Usage:
 * 1. Download your Firebase service account JSON file
 * 2. Run: node scripts/format-firebase-key.js path/to/your/service-account-key.json
 * 3. Copy the output and use it as your FIREBASE_SERVICE_ACCOUNT_KEY environment variable
 */

const fs = require('fs');
const path = require('path');

function formatFirebaseKey(jsonFilePath) {
  try {
    // Read the JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    
    // Parse and validate the JSON
    const serviceAccount = JSON.parse(jsonContent);
    
    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Error: Missing required fields:', missingFields.join(', '));
      process.exit(1);
    }
    
    // Stringify back to a single line
    const formattedKey = JSON.stringify(serviceAccount);
    
    console.log('✅ Successfully formatted Firebase service account key!');
    console.log('\n📋 Copy this value and set it as your FIREBASE_SERVICE_ACCOUNT_KEY environment variable:');
    console.log('\n' + '='.repeat(80));
    console.log(formattedKey);
    console.log('='.repeat(80));
    
    console.log('\n💡 Tips:');
    console.log('- Make sure to copy the ENTIRE line above');
    console.log('- Don\'t add any extra quotes or formatting');
    console.log('- For Vercel: Go to Settings → Environment Variables → Add FIREBASE_SERVICE_ACCOUNT_KEY');
    console.log('- For local development: Add to .env.local file');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you provided the correct path to your Firebase service account JSON file');
    process.exit(1);
  }
}

// Check if file path is provided
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.log('📖 Usage: node scripts/format-firebase-key.js path/to/your/service-account-key.json');
  console.log('\n📋 Steps:');
  console.log('1. Download your Firebase service account JSON file from Firebase Console');
  console.log('2. Run this script with the path to that file');
  console.log('3. Copy the output and use it as your environment variable');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(jsonFilePath)) {
  console.error('❌ Error: File not found:', jsonFilePath);
  process.exit(1);
}

formatFirebaseKey(jsonFilePath);
