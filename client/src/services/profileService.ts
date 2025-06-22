import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { ThemeType } from '../hooks/useTheme';

export interface UserProfile {
  displayName: string;
  bio: string;
  profilePictureUrl: string;
  theme: ThemeType;
  website?: string;
  followerCount?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createUserProfile = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile> => {
  const defaultProfile: UserProfile = {
    displayName: profile.displayName || 'Gallery User',
    bio: profile.bio || 'Welcome to my gallery!',
    profilePictureUrl: profile.profilePictureUrl || '',
    theme: profile.theme || 'wedding',
    website: profile.website || `${userId.slice(0, 8)}.gallery`,
    followerCount: '∞',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const finalProfile = { ...defaultProfile, ...profile };
  await setDoc(doc(db, 'user_profiles', userId), finalProfile);
  
  return finalProfile;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'user_profiles', userId));
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const profileRef = doc(db, 'user_profiles', userId);
  await updateDoc(profileRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const updateProfileName = async (
  userId: string,
  newDisplayName: string
): Promise<void> => {
  const batch = writeBatch(db);

  // Update the user profile
  const profileRef = doc(db, 'user_profiles', userId);
  batch.update(profileRef, {
    displayName: newDisplayName,
    updatedAt: new Date()
  });

  // Update all user media items to reflect the new name
  const mediaQuery = query(
    collection(db, 'user_media'),
    where('galleryId', '==', userId)
  );
  const mediaSnapshot = await getDocs(mediaQuery);
  
  mediaSnapshot.docs.forEach((mediaDoc) => {
    batch.update(mediaDoc.ref, {
      uploadedBy: newDisplayName
    });
  });

  // Update all user comments
  const commentsQuery = query(
    collection(db, 'user_comments'),
    where('galleryId', '==', userId)
  );
  const commentsSnapshot = await getDocs(commentsQuery);
  
  commentsSnapshot.docs.forEach((commentDoc) => {
    const data = commentDoc.data();
    if (data.userName === userId || data.deviceId === userId) {
      batch.update(commentDoc.ref, {
        userName: newDisplayName
      });
    }
  });

  // Update all user likes
  const likesQuery = query(
    collection(db, 'user_likes'),
    where('galleryId', '==', userId)
  );
  const likesSnapshot = await getDocs(likesQuery);
  
  likesSnapshot.docs.forEach((likeDoc) => {
    const data = likeDoc.data();
    if (data.userName === userId || data.deviceId === userId) {
      batch.update(likeDoc.ref, {
        userName: newDisplayName
      });
    }
  });

  // Update user stories
  const storiesQuery = query(
    collection(db, `users/${userId}/stories`)
  );
  const storiesSnapshot = await getDocs(storiesQuery);
  
  storiesSnapshot.docs.forEach((storyDoc) => {
    batch.update(storyDoc.ref, {
      userName: newDisplayName
    });
  });

  await batch.commit();
};

export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<string> => {
  const fileName = `profile_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
  const storageRef = ref(storage, `users/${userId}/profile/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

export const checkProfileSetupRequired = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    return !profile || !profile.displayName || profile.displayName === 'Gallery User';
  } catch (error) {
    console.error('Error checking profile setup:', error);
    // If we can't check, assume setup is needed
    return true;
  }
};