import { 
  doc, 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserGallery {
  id: string; // Same as user ID
  title: string;
  description?: string;
  theme: 'elegant' | 'modern' | 'rustic' | 'romantic';
  public: boolean;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  settings: {
    allowComments: boolean;
    allowLikes: boolean;
    allowStories: boolean;
    passwordProtected: boolean;
    password?: string;
    adminPassword?: string;
  };
}

export interface UserMediaItem {
  id: string;
  galleryId: string; // References the gallery (user ID)
  name: string;
  url: string;
  type: 'image' | 'video' | 'note';
  uploadedBy: string;
  uploadedAt: string;
  caption?: string;
  noteText?: string;
  isPrivate: boolean;
  tags: string[];
  // Compatibility fields for existing components
  deviceId: string; // Maps to galleryId for compatibility
  isUnavailable?: boolean;
}

// Create default gallery for new user with proper name handling
export const createUserGallery = async (
  userId: string,
  userName: string,
  adminPassword?: string
): Promise<void> => {
  // Ensure we have a meaningful name, not a UID
  const displayName = userName && userName.length > 0 && !userName.includes('-') && !userName.includes('_') 
    ? userName 
    : 'Meine Galerie';
    
  const defaultGallery: UserGallery = {
    id: userId,
    title: `${displayName}s Hochzeitsgalerie`,
    description: 'Willkommen in unserer wunderschönen Hochzeitsgalerie!',
    theme: 'elegant',
    public: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
    settings: {
      allowComments: true,
      allowLikes: true,
      allowStories: true,
      passwordProtected: false,
      adminPassword: adminPassword
    }
  };

  await setDoc(doc(db, 'galleries', userId), defaultGallery);
};

// Get user's gallery
export const getUserGallery = async (userId: string): Promise<UserGallery | null> => {
  try {
    const galleryDoc = await getDocs(query(
      collection(db, 'galleries'),
      where('userId', '==', userId)
    ));

    if (galleryDoc.empty) {
      return null;
    }

    return { ...galleryDoc.docs[0].data(), id: galleryDoc.docs[0].id } as UserGallery;
  } catch (error) {
    console.error('Error fetching user gallery:', error);
    return null;
  }
};

// Subscribe to user's media items
export const subscribeToUserMedia = (
  userId: string,
  callback: (items: UserMediaItem[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'user_media'),
    where('galleryId', '==', userId),
    orderBy('uploadedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const items: UserMediaItem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserMediaItem));

    console.log(`📱 Loaded ${items.length} media items for user ${userId}`);
    callback(items);
  }, (error) => {
    console.error('Error loading user media:', error);
    callback([]);
  });
};

// Update gallery settings
export const updateGallerySettings = async (
  userId: string,
  updates: Partial<UserGallery>
): Promise<void> => {
  await updateDoc(doc(db, 'galleries', userId), {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

// Subscribe to user's comments (isolated)
export const subscribeToUserComments = (
  userId: string,
  callback: (comments: any[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'user_comments'),
    where('galleryId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(comments);
  }, (error) => {
    console.error('Error loading user comments:', error);
    callback([]);
  });
};

// Subscribe to user's likes (isolated)
export const subscribeToUserLikes = (
  userId: string,
  callback: (likes: any[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'user_likes'),
    where('galleryId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const likes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(likes);
  }, (error) => {
    console.error('Error loading user likes:', error);
    callback([]);
  });
};