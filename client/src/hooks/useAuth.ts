import { useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { createUserGallery } from '../services/userGalleryService';

interface AuthUser extends User {
  displayName: string | null;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as AuthUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's display name
    await updateProfile(newUser, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', newUser.uid), {
      email: newUser.email,
      displayName,
      createdAt: new Date(),
      uid: newUser.uid,
      needsAdminPasswordSetup: true // Flag to show admin password setup
    });

    // Gallery will be created after admin password setup
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    logout
  };
}