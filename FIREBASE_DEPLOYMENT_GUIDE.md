# Firebase Security Rules Deployment Guide

## Quick Fix for Permission Errors

Your WeddingPix app is experiencing Firebase permission errors because the security rules haven't been deployed. Here's how to fix it:

### Option 1: Firebase Console (Recommended)

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project**: `dev1-b3973`
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Copy the entire content from `firestore.rules` file** (see below)
6. **Paste it in the Firebase Console rules editor**
7. **Click "Publish"**

### Option 2: Storage Rules

1. **In Firebase Console, go to Storage**
2. **Click "Rules" tab**
3. **Copy content from `storage.rules` file**
4. **Paste and publish**

### Firestore Rules Content

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
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/recaps/{recapId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Spotify tokens - user specific
    match /spotify_tokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Wedding playlists - user specific
    match /wedding_playlists/{playlistId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    // Global collections for app functionality
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
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == docId;
    }
    
    match /stories/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User profiles
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Timeline events
    match /timeline/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Storage Rules Content

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    match /galleries/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## After Deployment

Once you deploy these rules:
- Profile settings will persist after relog
- Gallery photo/video uploads will work
- Stories functionality will be enabled
- Timeline features will be accessible
- Real-time comments and likes will function

## Troubleshooting

If you still see permission errors after deployment:
1. Wait 1-2 minutes for rules to propagate
2. Refresh the page (Ctrl+F5)
3. Check Firebase Console for any rule syntax errors