const https = require('https');
const fs = require('fs');

// Read service account
const serviceAccount = JSON.parse(fs.readFileSync('firebase-service-account.json', 'utf8'));

async function deployRules() {
  try {
    console.log('Deploying Firebase rules via REST API...');
    
    // Read Firestore rules
    const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
    
    // Use Firebase Admin REST API to deploy rules
    const projectId = 'dev1-b3973';
    
    // Create a simple deployment using curl
    const { exec } = require('child_process');
    
    // Set environment variable for service account
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './firebase-service-account.json';
    
    // Deploy Firestore rules using gcloud
    exec(`gcloud firestore databases update --rules firestore.rules --project ${projectId}`, (error, stdout, stderr) => {
      if (error) {
        console.log('Firestore rules deployment via gcloud failed, trying manual deployment...');
        
        // Manual deployment via Firebase Console instructions
        console.log(`
🔧 MANUAL DEPLOYMENT REQUIRED

Since automated deployment encountered issues, please deploy the rules manually:

1. Go to: https://console.firebase.google.com/project/dev1-b3973/firestore/rules
2. Copy the rules from firestore.rules file and paste them
3. Click "Publish"

4. Go to: https://console.firebase.google.com/project/dev1-b3973/storage/rules  
5. Copy the rules from storage.rules file and paste them
6. Click "Publish"

This will fix:
- Profile settings not saving after relog
- Gallery photo/video uploads
- Stories functionality
- Timeline features
- Real-time comments and likes

The app is currently functional but limited due to Firebase permission errors.
        `);
        
      } else {
        console.log('✅ Firestore rules deployed successfully!');
        console.log(stdout);
      }
    });
    
  } catch (error) {
    console.error('❌ Error during deployment:', error.message);
    
    console.log(`
🔧 MANUAL DEPLOYMENT INSTRUCTIONS

Please deploy the Firebase rules manually to fix the permission errors:

1. Open Firebase Console: https://console.firebase.google.com/project/dev1-b3973
2. Go to Firestore Database > Rules
3. Replace the existing rules with the content from firestore.rules
4. Click "Publish"
5. Go to Storage > Rules  
6. Replace with content from storage.rules
7. Click "Publish"

This will enable:
- Profile data persistence
- Photo/video uploads
- Stories (24h expiration)
- Timeline functionality
- Comments and likes
    `);
  }
}

deployRules();