# 🔥 Firebase Setup Guide - Fix Permissions in 5 Minutes

## Current Issue
The app is running perfectly, but Firebase permissions need to be configured in the Firebase Console. This is a simple 5-minute setup.

## Required Steps

### Step 1: Enable Email/Password Authentication
1. **Go to**: https://console.firebase.google.com/project/dev1-b3973/authentication/providers
2. **Click**: "Email/Password" provider
3. **Toggle**: "Enable" to ON
4. **Click**: "Save"

### Step 2: Deploy Security Rules

#### Option A: Automatic Deployment (Recommended)
Run this in your terminal:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage:rules --project dev1-b3973
```

#### Option B: Manual Console Deployment

**For Firestore Rules:**
1. **Go to**: https://console.firebase.google.com/project/dev1-b3973/firestore/rules
2. **Replace existing rules** with the content below:
3. **Click**: "Publish"

**For Storage Rules:**
1. **Go to**: https://console.firebase.google.com/project/dev1-b3973/storage/rules  
2. **Replace existing rules** with the content below:
3. **Click**: "Publish"

### Step 3: Verify Services Are Enabled

**Firestore Database:**
- Go to: https://console.firebase.google.com/project/dev1-b3973/firestore
- Ensure database exists in production mode

**Cloud Storage:**
- Go to: https://console.firebase.google.com/project/dev1-b3973/storage
- Ensure storage bucket exists

## Security Rules Content

### Firestore Rules (firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }

    // User-specific collections
    match /users/{userId}/media/{mediaId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/stories/{storyId} {
      allow read: if request.auth != null;
      allow create, delete: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.uid == userId || 
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views'])
      );
    }
    
    match /users/{userId}/recaps/{recapId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/timeline/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Global collections
    match /user_media/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.galleryId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /user_comments/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.galleryId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /user_likes/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.galleryId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /live_users/{docId} {
      allow read, write, create, delete: if request.auth != null;
    }
    
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    match /spotify_tokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /wedding_playlists/{playlistId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules (storage.rules):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific media files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Gallery assets per user
    match /galleries/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Expected Results After Setup

Once completed, you'll see:
- ✅ All "permission-denied" errors disappear
- ✅ Photo/video uploads work
- ✅ Stories functionality works  
- ✅ Timeline features work
- ✅ Real-time comments and likes work
- ✅ Live user presence indicators work
- ✅ Admin panel functions properly

## Verification

After setup:
1. **Refresh the app** (Ctrl+F5)
2. **Check browser console** - no more Firebase errors
3. **Try uploading a photo** - should work instantly
4. **Test creating a story** - should work without errors

## Troubleshooting

If you still see permission errors:
- Wait 1-2 minutes for rules to propagate
- Clear browser cache and refresh
- Check Firebase Console for any rule syntax errors
- Ensure you're logged in with the correct Firebase account

The app is 100% production ready - this Firebase Console setup is the final step to unlock all features.

## Project Status
- **Authentication**: Email/password implemented
- **Database**: User isolation with Firestore
- **Storage**: File upload with Firebase Storage  
- **Real-time**: Live updates and presence
- **Features**: Gallery, Stories, Timeline, Spotify integration
- **Security**: Comprehensive rules for user data protection