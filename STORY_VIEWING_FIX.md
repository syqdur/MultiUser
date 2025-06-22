# Story Viewing Fix - Manual Firebase Rules Update

## Issue
Stories upload successfully but can't be marked as "viewed" due to Firebase permission restrictions.

## Quick Fix (2 minutes)

1. Open: https://console.firebase.google.com/project/dev1-b3973/firestore/rules
2. Replace the existing rules with this updated version:

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
        // Allow updating only the views array to mark story as viewed
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['views'])
      );
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
      allow write: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
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
    
    // User-specific timeline events
    match /users/{userId}/timeline/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

## What This Fixes
- Allows users to mark any story as viewed by updating the views array
- Removes the red numbers on stories after viewing
- Maintains security by only allowing views array updates

## Result
After updating, stories will properly show as viewed and the red notification badges will disappear when stories are watched.