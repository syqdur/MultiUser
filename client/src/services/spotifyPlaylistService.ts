import { getValidSpotifyTokens } from './spotifyAuthService';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  owner: {
    display_name: string;
    id: string;
  };
  public: boolean;
  collaborative: boolean;
}

export interface WeddingPlaylist {
  id: string;
  userId: string;
  spotifyPlaylistId: string;
  name: string;
  description: string;
  category: 'ceremony' | 'reception' | 'party' | 'background' | 'custom';
  imageUrl?: string;
  trackCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  spotifyUrl: string;
}

export interface PlaylistTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

// Get user's Spotify playlists
export const getUserSpotifyPlaylists = async (userId: string, limit: number = 50): Promise<SpotifyPlaylist[]> => {
  const tokens = await getValidSpotifyTokens(userId);
  if (!tokens) return [];

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return [];
  }
};

// Add playlist to wedding gallery
export const addPlaylistToGallery = async (
  userId: string, 
  spotifyPlaylist: SpotifyPlaylist, 
  category: WeddingPlaylist['category'],
  customDescription?: string
): Promise<WeddingPlaylist> => {
  const weddingPlaylist: WeddingPlaylist = {
    id: `${userId}_${spotifyPlaylist.id}`,
    userId,
    spotifyPlaylistId: spotifyPlaylist.id,
    name: spotifyPlaylist.name,
    description: customDescription || spotifyPlaylist.description || '',
    category,
    imageUrl: spotifyPlaylist.images[0]?.url,
    trackCount: spotifyPlaylist.tracks.total,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spotifyUrl: spotifyPlaylist.external_urls.spotify
  };

  await setDoc(doc(db, 'wedding_playlists', weddingPlaylist.id), weddingPlaylist);
  console.log(`✅ Playlist "${spotifyPlaylist.name}" added to gallery`);
  
  return weddingPlaylist;
};

// Get wedding playlists for user
export const subscribeToWeddingPlaylists = (
  userId: string,
  callback: (playlists: WeddingPlaylist[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'wedding_playlists'),
    where('userId', '==', userId),
    where('isActive', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const playlists: WeddingPlaylist[] = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as WeddingPlaylist));

    callback(playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, (error) => {
    console.error('Error loading wedding playlists:', error);
    callback([]);
  });
};

// Get playlist tracks
export const getPlaylistTracks = async (userId: string, playlistId: string): Promise<PlaylistTrack[]> => {
  const tokens = await getValidSpotifyTokens(userId);
  if (!tokens) return [];

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    return data.items?.map((item: any) => item.track).filter((track: any) => track) || [];
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    return [];
  }
};

// Remove playlist from gallery
export const removePlaylistFromGallery = async (playlistId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'wedding_playlists', playlistId), {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Playlist removed from gallery`);
  } catch (error) {
    console.error('Error removing playlist from gallery:', error);
    throw error;
  }
};

// Create new Spotify playlist for wedding
export const createWeddingPlaylist = async (
  userId: string,
  name: string,
  description: string,
  category: WeddingPlaylist['category'],
  isPublic: boolean = false
): Promise<WeddingPlaylist | null> => {
  const tokens = await getValidSpotifyTokens(userId);
  if (!tokens) return null;

  try {
    // Get user's Spotify profile to create playlist
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const profile = await profileResponse.json();

    // Create playlist on Spotify
    const createResponse = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create playlist: ${createResponse.status}`);
    }

    const spotifyPlaylist = await createResponse.json();

    // Add to wedding gallery
    return await addPlaylistToGallery(userId, spotifyPlaylist, category, description);
  } catch (error) {
    console.error('Error creating wedding playlist:', error);
    return null;
  }
};

// Update playlist category or description
export const updateWeddingPlaylist = async (
  playlistId: string,
  updates: Partial<Pick<WeddingPlaylist, 'category' | 'description'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'wedding_playlists', playlistId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Wedding playlist updated`);
  } catch (error) {
    console.error('Error updating wedding playlist:', error);
    throw error;
  }
};

// Search Spotify tracks
export const searchSpotifyTracks = async (userId: string, query: string, limit: number = 20): Promise<PlaylistTrack[]> => {
  const tokens = await getValidSpotifyTokens(userId);
  if (!tokens) return [];

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    return [];
  }
};