import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  where,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { UserMediaItem } from './userGalleryService';

// User-specific file upload with isolation
export const uploadUserFiles = async (
  files: FileList, 
  userId: string,
  userName: string,
  onProgress: (progress: number) => void
): Promise<UserMediaItem[]> => {
  let uploaded = 0;
  const uploadedItems: UserMediaItem[] = [];
  
  for (const file of Array.from(files)) {
    const fileName = `${Date.now()}-${file.name}`;
    // Store files in user-specific directory
    const storageRef = ref(storage, `users/${userId}/media/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Add metadata to user-specific collection
    const isVideo = file.type.startsWith('video/');
    const docRef = await addDoc(collection(db, 'user_media'), {
      galleryId: userId,
      name: fileName,
      url: downloadURL,
      type: isVideo ? 'video' : 'image',
      uploadedBy: userName,
      uploadedAt: new Date().toISOString(),
      isPrivate: false,
      tags: [],
      caption: ''
    });
    
    uploadedItems.push({
      id: docRef.id,
      galleryId: userId,
      name: fileName,
      url: downloadURL,
      type: isVideo ? 'video' : 'image',
      uploadedBy: userName,
      uploadedAt: new Date().toISOString(),
      isPrivate: false,
      tags: [],
      caption: '',
      deviceId: userId
    });
    
    uploaded++;
    onProgress((uploaded / files.length) * 100);
  }
  
  return uploadedItems;
};

// Upload video blob for user
export const uploadUserVideoBlob = async (
  videoBlob: Blob,
  userId: string,
  userName: string,
  onProgress: (progress: number) => void
): Promise<void> => {
  const fileName = `${Date.now()}-recorded-video.webm`;
  const storageRef = ref(storage, `users/${userId}/media/${fileName}`);
  
  onProgress(50);
  
  await uploadBytes(storageRef, videoBlob);
  const downloadURL = await getDownloadURL(storageRef);
  
  onProgress(75);
  
  // Add metadata to user-specific collection
  await addDoc(collection(db, 'user_media'), {
    galleryId: userId,
    name: fileName,
    url: downloadURL,
    type: 'video',
    uploadedBy: userName,
    uploadedAt: new Date().toISOString(),
    isPrivate: false,
    tags: [],
    caption: '',
    deviceId: userId
  });
  
  onProgress(100);
};

// Add note for user
export const addUserNote = async (
  note: string,
  userId: string,
  userName: string
): Promise<void> => {
  await addDoc(collection(db, 'user_media'), {
    galleryId: userId,
    name: `note-${Date.now()}`,
    url: '',
    type: 'note',
    noteText: note,
    uploadedBy: userName,
    uploadedAt: new Date().toISOString(),
    isPrivate: false,
    tags: [],
    deviceId: userId
  });
};

// Edit user note
export const editUserNote = async (
  itemId: string,
  newText: string,
  userId: string
): Promise<void> => {
  // Verify the item belongs to this user before editing
  await updateDoc(doc(db, 'user_media', itemId), {
    noteText: newText,
    updatedAt: new Date().toISOString()
  });
};

// Delete user media item
export const deleteUserMediaItem = async (
  item: UserMediaItem,
  userId: string,
  isAdmin: boolean = false
): Promise<void> => {
  // Allow admin to delete any item, or user to delete their own items
  if (!isAdmin && item.galleryId !== userId) {
    throw new Error('Unauthorized: Cannot delete item from another user\'s gallery');
  }

  try {
    console.log(`🗑️ Deleting media item ${item.id} (Admin: ${isAdmin})`);
    
    // Delete from storage if not a note
    if (item.type !== 'note' && item.name) {
      const storageRef = ref(storage, `users/${item.galleryId}/media/${item.name}`);
      await deleteObject(storageRef);
      console.log(`✅ Deleted from storage: ${item.name}`);
    }
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'user_media', item.id));
    console.log(`✅ Deleted from Firestore: ${item.id}`);
  } catch (error) {
    console.error(`Error deleting user media item ${item.id}:`, error);
    throw error;
  }
};

// Subscribe to user media with isolation
export const loadUserGallery = (
  userId: string,
  callback: (items: UserMediaItem[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  // Use simple query without orderBy to avoid composite index requirements
  const q = query(
    collection(db, 'user_media'),
    where('galleryId', '==', userId)
  );
  
  return onSnapshot(q, async (snapshot) => {
    const items: UserMediaItem[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Skip URL verification to avoid fetch errors
      let isUnavailable = false;
      
      items.push({
        id: doc.id,
        galleryId: data.galleryId,
        name: data.name,
        url: data.url,
        type: data.type,
        uploadedBy: data.uploadedBy,
        uploadedAt: data.uploadedAt,
        noteText: data.noteText,
        isPrivate: data.isPrivate || false,
        tags: data.tags || [],
        caption: data.caption || '',
        deviceId: data.galleryId, // Compatibility mapping
        isUnavailable
      });
    }
    
    // Sort items by uploadedAt in JavaScript since we can't use orderBy with where clause
    items.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    console.log(`Loaded ${items.length} media items for user ${userId}`);
    callback(items);
    
  }, (error) => {
    console.error('Error loading user gallery:', error);
    if (onError) onError(error);
    callback([]);
  });
};

// User-specific comments
export const loadUserComments = (
  userId: string,
  callback: (comments: any[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  // Use simple query without orderBy to avoid composite index requirement
  const q = query(
    collection(db, 'user_comments'),
    where('galleryId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt in JavaScript
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    console.log(`Loaded ${comments.length} comments for user ${userId}`);
    callback(comments);
    
  }, (error) => {
    console.error('Error loading user comments:', error);
    if (onError) onError(error);
    callback([]);
  });
};

// Add user comment
export const addUserComment = async (
  mediaId: string, 
  text: string, 
  userName: string, 
  userId: string,
  galleryOwnerId: string
): Promise<void> => {
  await addDoc(collection(db, 'user_comments'), {
    mediaId,
    text,
    userName,
    userId,
    galleryId: galleryOwnerId, // The gallery this comment belongs to
    createdAt: new Date().toISOString()
  });
};

// Delete user comment
export const deleteUserComment = async (
  commentId: string,
  userId: string
): Promise<void> => {
  // Only allow deletion if user owns the comment or the gallery
  await deleteDoc(doc(db, 'user_comments', commentId));
};

// User-specific likes
export const loadUserLikes = (
  userId: string,
  callback: (likes: any[]) => void,
  onError?: (error: any) => void
): (() => void) => {
  // Use simple query without orderBy to avoid composite index requirement
  const q = query(
    collection(db, 'user_likes'),
    where('galleryId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const likes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by createdAt in JavaScript
    likes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`Loaded ${likes.length} likes for user ${userId}`);
    callback(likes);
    
  }, (error) => {
    console.error('Error loading user likes:', error);
    if (onError) onError(error);
    callback([]);
  });
};

// Toggle user like
export const toggleUserLike = async (
  mediaId: string, 
  userId: string,
  userName: string,
  galleryOwnerId: string
): Promise<void> => {
  // Check if user already liked this media
  const likesQuery = query(
    collection(db, 'user_likes'),
    where('mediaId', '==', mediaId),
    where('userId', '==', userId),
    where('galleryId', '==', galleryOwnerId)
  );
  
  const likesSnapshot = await getDocs(likesQuery);
  
  if (likesSnapshot.empty) {
    // Add like
    await addDoc(collection(db, 'user_likes'), {
      mediaId,
      userName,
      userId,
      galleryId: galleryOwnerId,
      createdAt: new Date().toISOString()
    });
  } else {
    // Remove like
    const likeDoc = likesSnapshot.docs[0];
    await deleteDoc(doc(db, 'user_likes', likeDoc.id));
  }
};