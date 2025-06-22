import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Enhanced Firebase authentication handler with better error handling
export const setupAuthStateListener = () => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('✅ User authenticated:', user.uid);
    } else {
      console.log('❌ User not authenticated');
    }
  }, (error) => {
    console.error('❌ Auth state error:', error);
    if (error.code === 'auth/operation-not-allowed') {
      console.error('❌ Email/password authentication is not enabled in Firebase Console');
      console.error('🔧 Please enable Email/Password authentication in Firebase Console:');
      console.error('   1. Go to https://console.firebase.google.com/project/dev1-b3973/authentication');
      console.error('   2. Click "Sign-in method" tab');
      console.error('   3. Enable "Email/Password" provider');
    }
  });
};

// Check authentication status
export const checkAuthStatus = () => {
  const user = auth.currentUser;
  if (user) {
    console.log('✅ Currently authenticated as:', user.email);
    return true;
  } else {
    console.log('❌ Not authenticated - Firebase permission errors expected');
    return false;
  }
};