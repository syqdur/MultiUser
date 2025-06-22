# Quick Fix: Deploy Firebase Rules

## Problem
✅ Authentication is enabled  
❌ Security rules not deployed → permission errors

## Solution (2 minutes)
Deploy the security rules to Firebase Console:

### Option 1: Firebase Console (Easiest)
1. **Firestore Rules**: https://console.firebase.google.com/project/dev1-b3973/firestore/rules
   - Copy content from `firestore.rules` file
   - Paste and click "Publish"

2. **Storage Rules**: https://console.firebase.google.com/project/dev1-b3973/storage/rules  
   - Copy content from `storage.rules` file
   - Paste and click "Publish"

### Option 2: CLI (If you have Firebase CLI)
```bash
firebase deploy --only firestore:rules,storage
```

## After Deployment
- Refresh the app
- All permission errors will disappear
- Full functionality restored