#!/usr/bin/env node

/**
 * Firebase Service Account Key Formatter
 * 
 * This script helps format Firebase service account keys properly for deployment.
 * It can be used to validate and format the JSON key.
 */

const fs = require('fs');
const path = require('path');

function formatFirebaseKey() {
  console.log('🔧 Firebase Service Account Key Formatter');
  console.log('==========================================\n');

  // Check if key is provided as argument
  const keyArg = process.argv[2];
  
  if (keyArg) {
    console.log('📝 Processing provided key...');
    processKey(keyArg);
    return;
  }

  // Check if key is in environment variable
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (envKey) {
    console.log('📝 Processing environment variable key...');
    processKey(envKey);
    return;
  }

  // Check if key file exists
  const keyFile = path.join(process.cwd(), 'firebase-service-account.json');
  
  if (fs.existsSync(keyFile)) {
    console.log('📝 Processing key file...');
    const keyContent = fs.readFileSync(keyFile, 'utf8');
    processKey(keyContent);
    return;
  }

  console.log('❌ No Firebase service account key found.');
  console.log('\nUsage options:');
  console.log('1. node scripts/format-firebase-key.js "your-json-key-here"');
  console.log('2. FIREBASE_SERVICE_ACCOUNT_KEY="your-key" node scripts/format-firebase-key.js');
  console.log('3. Place your key in firebase-service-account.json file');
  console.log('\nFor deployment, set the environment variable:');
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
}

function processKey(keyString) {
  try {
    console.log('\n🔍 Analyzing key...');
    
    // Show preview
    const preview = keyString.trim().substring(0, 100);
    console.log('Preview:', preview + (keyString.length > 100 ? '...' : ''));
    
    // Clean the key
    let cleanedKey = keyString.trim();
    
    // Replace single quotes with double quotes
    cleanedKey = cleanedKey.replace(/'/g, '"');
    
    // Try to parse
    const parsedKey = JSON.parse(cleanedKey);
    
    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !parsedKey[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields.join(', '));
      return;
    }
    
    console.log('✅ Key is valid!');
    console.log('📋 Key details:');
    console.log('   Type:', parsedKey.type);
    console.log('   Project ID:', parsedKey.project_id);
    console.log('   Client Email:', parsedKey.client_email);
    console.log('   Private Key:', parsedKey.private_key ? 'Present' : 'Missing');
    
    // Generate formatted key for deployment
    const formattedKey = JSON.stringify(parsedKey);
    console.log('\n🚀 Formatted key for deployment:');
    console.log('FIREBASE_SERVICE_ACCOUNT_KEY=\'' + formattedKey + '\'');
    
    // Save to file
    const outputFile = path.join(process.cwd(), 'firebase-key-formatted.json');
    fs.writeFileSync(outputFile, formattedKey);
    console.log('\n💾 Formatted key saved to:', outputFile);
    
  } catch (error) {
    console.log('❌ Error processing key:', error.message);
    
    if (error.message.includes('Unexpected token')) {
      console.log('\n🔧 Common issues:');
      console.log('1. Key might be truncated or incomplete');
      console.log('2. Single quotes instead of double quotes');
      console.log('3. Missing quotes around property names');
      console.log('4. Invalid JSON structure');
      
      console.log('\n📝 Expected format:');
      console.log('{"type":"service_account","project_id":"your-project",...}');
    }
  }
}

// Run the formatter
formatFirebaseKey();