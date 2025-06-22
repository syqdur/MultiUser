#!/usr/bin/env node
import { execSync } from 'child_process';

try {
  console.log('🚀 Deploying Firebase rules...');
  execSync('npx firebase deploy --only firestore:rules --project dev1-b3973 --non-interactive', { 
    stdio: 'inherit',
    timeout: 30000 
  });
  console.log('✅ Rules deployed successfully!');
} catch (error) {
  console.log('❌ Deployment failed, manual setup required');
  console.log('\nManual steps:');
  console.log('1. Go to https://console.firebase.google.com/project/dev1-b3973/firestore/rules');
  console.log('2. Copy rules from firestore.rules file');
  console.log('3. Click Publish');
}