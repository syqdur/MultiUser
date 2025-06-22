# Firebase Authentication - Quick Fix Guide

## Current Issue
The application shows "permission-denied" errors because Email/Password authentication is not enabled in your Firebase project.

## Solution (5 minute fix)

### Step 1: Enable Authentication
1. Go to https://console.firebase.google.com/project/dev1-b3973/authentication
2. Click "Get started" (if first time) or go to "Sign-in method" tab
3. Click on "Email/Password" provider
4. Toggle "Enable" to ON
5. Click "Save"

### Step 2: Verify Firestore Database
1. Go to https://console.firebase.google.com/project/dev1-b3973/firestore
2. Ensure database exists and is in "production mode"
3. Rules should already be configured (they're in your codebase)

### Step 3: Verify Storage
1. Go to https://console.firebase.google.com/project/dev1-b3973/storage
2. Ensure storage bucket exists
3. Rules should already be configured

## Expected Result
After enabling Email/Password authentication:
- All Firebase permission errors will disappear
- User registration and login will work
- Media upload, stories, and Spotify features will function
- Real-time presence indicators will work

## Test After Setup
1. Restart the application
2. Try creating a new account
3. Upload a photo or create a story
4. Verify no more "permission-denied" errors in console

The code is already production-ready - this is just a configuration step in Firebase Console.