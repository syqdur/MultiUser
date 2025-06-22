import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createUserGallery } from './userGalleryService';

// Simple hash function for password storage (in production, use proper encryption)
const hashPassword = (password: string): string => {
  // In a real application, use bcrypt or similar
  // For this demo, we'll use a simple base64 encoding with salt
  const salt = 'weddingpix_admin_salt';
  return btoa(salt + password + salt);
};

export const verifyAdminPassword = (inputPassword: string, storedHash: string): boolean => {
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
};

export const setupAdminPassword = async (
  userId: string, 
  password: string, 
  displayName: string
): Promise<void> => {
  try {
    // Hash the password
    const hashedPassword = hashPassword(password);
    
    // Create gallery with admin password
    await createUserGallery(userId, displayName, hashedPassword);
    
    // Update user document to remove setup flag
    await updateDoc(doc(db, 'users', userId), {
      needsAdminPasswordSetup: false,
      adminPasswordSet: true
    });
    
    console.log(`✅ Admin password setup completed for user ${userId}`);
  } catch (error) {
    console.error('Error setting up admin password:', error);
    throw new Error('Fehler beim Einrichten des Admin-Passworts');
  }
};

export const checkAdminPasswordSetup = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return !userData.needsAdminPasswordSetup;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin password setup:', error);
    return false;
  }
};

export const validateAdminAccess = async (userId: string, password: string): Promise<boolean> => {
  try {
    const galleryDoc = await getDoc(doc(db, 'galleries', userId));
    if (galleryDoc.exists()) {
      const galleryData = galleryDoc.data();
      const storedHash = galleryData.settings?.adminPassword;
      
      if (storedHash) {
        return verifyAdminPassword(password, storedHash);
      }
    }
    return false;
  } catch (error) {
    console.error('Error validating admin access:', error);
    return false;
  }
};