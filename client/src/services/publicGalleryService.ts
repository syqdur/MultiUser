import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface PublicGallerySettings {
  isPublic: boolean;
  passwordProtected: boolean;
  password?: string;
  allowComments: boolean;
  allowLikes: boolean;
  customMessage?: string;
  expiresAt?: string; // Optional expiration date
}

export interface PublicGalleryStats {
  views: number;
  uniqueVisitors: number;
  lastViewed: string;
  popularMedia: string[]; // Media IDs sorted by popularity
}

// Enable public sharing for a user's gallery
export const enablePublicSharing = async (
  userId: string,
  settings: PublicGallerySettings
): Promise<string> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    // Generate public URL
    const publicUrl = `${window.location.origin}/p/${userId}`;
    
    // Update user document with public settings
    await updateDoc(userDocRef, {
      publicGallery: settings.isPublic,
      passwordProtected: settings.passwordProtected,
      galleryPassword: settings.password || null,
      allowPublicComments: settings.allowComments,
      allowPublicLikes: settings.allowLikes,
      customMessage: settings.customMessage || '',
      publicUrl,
      publicExpiresAt: settings.expiresAt || null,
      publicEnabledAt: new Date().toISOString(),
      // Initialize stats
      publicStats: {
        views: 0,
        uniqueVisitors: 0,
        lastViewed: null,
        popularMedia: []
      }
    });
    
    return publicUrl;
  } catch (error) {
    console.error('Error enabling public sharing:', error);
    throw new Error('Failed to enable public sharing');
  }
};

// Disable public sharing
export const disablePublicSharing = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    await updateDoc(userDocRef, {
      publicGallery: false,
      passwordProtected: false,
      galleryPassword: null,
      publicUrl: null,
      publicDisabledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error disabling public sharing:', error);
    throw new Error('Failed to disable public sharing');
  }
};

// Update public gallery settings
export const updatePublicGallerySettings = async (
  userId: string,
  settings: Partial<PublicGallerySettings>
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    const updateData: any = {};
    if (settings.isPublic !== undefined) updateData.publicGallery = settings.isPublic;
    if (settings.passwordProtected !== undefined) updateData.passwordProtected = settings.passwordProtected;
    if (settings.password !== undefined) updateData.galleryPassword = settings.password;
    if (settings.allowComments !== undefined) updateData.allowPublicComments = settings.allowComments;
    if (settings.allowLikes !== undefined) updateData.allowPublicLikes = settings.allowLikes;
    if (settings.customMessage !== undefined) updateData.customMessage = settings.customMessage;
    if (settings.expiresAt !== undefined) updateData.publicExpiresAt = settings.expiresAt;
    
    updateData.publicUpdatedAt = new Date().toISOString();
    
    await updateDoc(userDocRef, updateData);
  } catch (error) {
    console.error('Error updating public gallery settings:', error);
    throw new Error('Failed to update public gallery settings');
  }
};

// Track public gallery view
export const trackPublicView = async (
  userId: string,
  visitorId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return;
    
    const currentStats = userDoc.data().publicStats || {
      views: 0,
      uniqueVisitors: 0,
      lastViewed: null,
      popularMedia: []
    };
    
    // Check if this is a unique visitor
    const visitorsQuery = query(
      collection(db, `users/${userId}/visitors`),
      where('visitorId', '==', visitorId)
    );
    
    const existingVisitors = await getDocs(visitorsQuery);
    const isNewVisitor = existingVisitors.empty;
    
    // Update stats
    const updatedStats = {
      views: currentStats.views + 1,
      uniqueVisitors: isNewVisitor ? currentStats.uniqueVisitors + 1 : currentStats.uniqueVisitors,
      lastViewed: new Date().toISOString(),
      popularMedia: currentStats.popularMedia || []
    };
    
    await updateDoc(userDocRef, {
      publicStats: updatedStats
    });
    
    // Track visitor if new
    if (isNewVisitor) {
      await doc(collection(db, `users/${userId}/visitors`)).set({
        visitorId,
        firstVisit: new Date().toISOString(),
        totalVisits: 1
      });
    } else {
      // Update existing visitor
      const visitorDoc = existingVisitors.docs[0];
      await updateDoc(visitorDoc.ref, {
        lastVisit: new Date().toISOString(),
        totalVisits: (visitorDoc.data().totalVisits || 1) + 1
      });
    }
  } catch (error) {
    console.error('Error tracking public view:', error);
    // Don't throw error for tracking failures
  }
};

// Get public gallery stats
export const getPublicGalleryStats = async (userId: string): Promise<PublicGalleryStats | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return null;
    
    return userDoc.data().publicStats || {
      views: 0,
      uniqueVisitors: 0,
      lastViewed: null,
      popularMedia: []
    };
  } catch (error) {
    console.error('Error getting public gallery stats:', error);
    return null;
  }
};

// Generate shareable link with custom message
export const generateShareableLink = (
  userId: string,
  customMessage?: string
): string => {
  const baseUrl = `${window.location.origin}/p/${userId}`;
  
  if (customMessage) {
    const encodedMessage = encodeURIComponent(customMessage);
    return `${baseUrl}?message=${encodedMessage}`;
  }
  
  return baseUrl;
};

// Check if gallery is accessible
export const checkGalleryAccess = async (
  userId: string,
  password?: string
): Promise<{
  accessible: boolean;
  requiresPassword: boolean;
  isExpired: boolean;
  customMessage?: string;
}> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { accessible: false, requiresPassword: false, isExpired: false };
    }
    
    const data = userDoc.data();
    
    // Check if gallery is public
    if (!data.publicGallery) {
      return { accessible: false, requiresPassword: false, isExpired: false };
    }
    
    // Check expiration
    if (data.publicExpiresAt) {
      const expiresAt = new Date(data.publicExpiresAt);
      if (expiresAt < new Date()) {
        return { accessible: false, requiresPassword: false, isExpired: true };
      }
    }
    
    // Check password protection
    if (data.passwordProtected && data.galleryPassword) {
      if (!password || password !== data.galleryPassword) {
        return { 
          accessible: false, 
          requiresPassword: true, 
          isExpired: false,
          customMessage: data.customMessage 
        };
      }
    }
    
    return { 
      accessible: true, 
      requiresPassword: false, 
      isExpired: false,
      customMessage: data.customMessage 
    };
  } catch (error) {
    console.error('Error checking gallery access:', error);
    return { accessible: false, requiresPassword: false, isExpired: false };
  }
};