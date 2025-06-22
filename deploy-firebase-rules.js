import admin from 'firebase-admin';
import fs from 'fs';
import { google } from 'googleapis';

// Initialize Firebase Admin with service account
import serviceAccount from './firebase-service-account.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dev1-b3973'
});

async function deployFirestoreRules() {
  try {
    console.log('🔧 Deploying Firestore security rules...');
    
    // Read the Firestore rules
    const rulesContent = fs.readFileSync('firestore.rules', 'utf8');
    
    // Deploy using Firebase Management API
    const { google } = require('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase']
    });
    
    const firebaseManagement = google.firebase({
      version: 'v1beta1',
      auth: auth
    });
    
    const projectId = 'dev1-b3973';
    
    // Create a new ruleset
    const rulesetResponse = await firebaseManagement.projects.rulesets.create({
      name: `projects/${projectId}`,
      requestBody: {
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: rulesContent
            }
          ]
        }
      }
    });
    
    const rulesetName = rulesetResponse.data.name;
    console.log('✅ Ruleset created:', rulesetName);
    
    // Deploy the ruleset to Firestore
    await firebaseManagement.projects.releases.create({
      name: `projects/${projectId}`,
      requestBody: {
        name: `projects/${projectId}/releases/cloud.firestore`,
        rulesetName: rulesetName
      }
    });
    
    console.log('✅ Firestore rules deployed successfully!');
    
  } catch (error) {
    console.error('❌ Error deploying Firestore rules:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function deployStorageRules() {
  try {
    console.log('🔧 Deploying Storage security rules...');
    
    // Read the Storage rules
    const rulesContent = fs.readFileSync('storage.rules', 'utf8');
    
    const { google } = require('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/firebase']
    });
    
    const firebaseManagement = google.firebase({
      version: 'v1beta1',
      auth: auth
    });
    
    const projectId = 'dev1-b3973';
    
    // Create a new ruleset for Storage
    const rulesetResponse = await firebaseManagement.projects.rulesets.create({
      name: `projects/${projectId}`,
      requestBody: {
        source: {
          files: [
            {
              name: 'storage.rules',
              content: rulesContent
            }
          ]
        }
      }
    });
    
    const rulesetName = rulesetResponse.data.name;
    console.log('✅ Storage ruleset created:', rulesetName);
    
    // Deploy the ruleset to Storage
    await firebaseManagement.projects.releases.create({
      name: `projects/${projectId}`,
      requestBody: {
        name: `projects/${projectId}/releases/firebase.storage`,
        rulesetName: rulesetName
      }
    });
    
    console.log('✅ Storage rules deployed successfully!');
    
  } catch (error) {
    console.error('❌ Error deploying Storage rules:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function main() {
  console.log('🚀 Starting Firebase rules deployment...');
  
  await deployFirestoreRules();
  await deployStorageRules();
  
  console.log('🎉 All Firebase rules deployed successfully!');
  console.log('💡 Please refresh your application to see the changes.');
}

main().catch(console.error);