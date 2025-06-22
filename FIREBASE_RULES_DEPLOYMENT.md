# Firebase Rules Deployment - Fix Permission Errors

## Current Issues
Your WeddingPix application is experiencing Firebase permission errors that prevent:
- Profile settings from saving after relog
- Photo/video uploads to gallery
- Stories functionality (24h expiration)
- Timeline features
- Real-time comments and likes

## Manual Deployment Steps

### Step 1: Deploy Firestore Rules

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/dev1-b3973/firestore/rules

2. **Copy Firestore Rules**
   - Open the `firestore.rules` file in your project
   - Copy all the content

3. **Paste and Publish**
   - Replace the existing rules in the Firebase Console
   - Click "Publish"

### Step 2: Deploy Storage Rules

1. **Open Storage Rules**
   - Go to: https://console.firebase.google.com/project/dev1-b3973/storage/rules

2. **Copy Storage Rules**
   - Open the `storage.rules` file in your project
   - Copy all the content

3. **Paste and Publish**
   - Replace the existing rules in the Firebase Console
   - Click "Publish"

## What These Rules Enable

### Firestore Rules
- User profile data persistence
- Gallery media metadata storage
- Comments and likes functionality
- Stories with automatic 24h expiration
- Timeline events and milestones
- Real-time presence tracking

### Storage Rules
- Photo and video uploads
- Profile picture storage
- Story media uploads
- Timeline media attachments

## Verification

After deployment, you should see:
- ✅ Profile settings save successfully
- ✅ Gallery photo/video uploads work
- ✅ Stories can be uploaded and viewed
- ✅ Timeline functionality restored
- ✅ Comments and likes work in real-time

## Troubleshooting

If you still see permission errors:
1. Wait 1-2 minutes for rules to propagate
2. Refresh your browser
3. Check Firebase Console for any rule syntax errors
4. Ensure you're logged in with correct Firebase account

The Firebase permissions banner will automatically disappear once rules are successfully deployed.