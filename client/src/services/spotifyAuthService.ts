import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  followers: { total: number };
  country: string;
}

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '00f80ab84d074aafacc982e93f47942c';
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'e403ceac0ab847b58a1386c4e815a033';

const getRedirectUri = (): string => {
  if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  }
  
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin + '/spotify/callback';
  }
  
  return 'https://your-domain.replit.app/spotify/callback';
};

const REDIRECT_URI = getRedirectUri();
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-top-read'
].join(' ');

// Generate secure random string for state
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Store tokens in Firestore
export const storeSpotifyTokens = async (userId: string, tokens: SpotifyTokens): Promise<void> => {
  const tokensDoc = {
    ...tokens,
    userId,
    updatedAt: new Date().toISOString()
  };
  
  await setDoc(doc(db, 'spotify_tokens', userId), tokensDoc);
  console.log(`✅ Spotify tokens stored for user ${userId}`);
};

// Get tokens from Firestore
export const getSpotifyTokens = async (userId: string): Promise<SpotifyTokens | null> => {
  try {
    const tokenDoc = await getDoc(doc(db, 'spotify_tokens', userId));
    if (tokenDoc.exists()) {
      const data = tokenDoc.data();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        scope: data.scope
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving Spotify tokens:', error);
    return null;
  }
};

// Check if tokens are valid and refresh if needed
export const getValidSpotifyTokens = async (userId: string): Promise<SpotifyTokens | null> => {
  const tokens = await getSpotifyTokens(userId);
  if (!tokens) return null;

  // Check if token is expired (with 5 minute buffer)
  const now = Date.now();
  const expiresAt = tokens.expires_at * 1000;
  
  if (now >= (expiresAt - 300000)) { // 5 minutes before expiry
    console.log('🔄 Refreshing expired Spotify token...');
    return await refreshSpotifyToken(userId, tokens.refresh_token);
  }

  return tokens;
};

// Refresh access token
export const refreshSpotifyToken = async (userId: string, refreshToken: string): Promise<SpotifyTokens | null> => {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    const newTokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken, // Keep old refresh token if not provided
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      scope: data.scope
    };

    await storeSpotifyTokens(userId, newTokens);
    console.log('✅ Spotify token refreshed successfully');
    
    return newTokens;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
};

// Initiate Spotify OAuth flow
export const initiateSpotifyAuth = (userId: string): void => {
  const state = generateRandomString(16);
  sessionStorage.setItem('spotify_auth_state', state);
  sessionStorage.setItem('spotify_auth_user', userId);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: 'true'
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

// Handle OAuth callback
export const handleSpotifyCallback = async (code: string, state: string): Promise<SpotifyTokens | null> => {
  const storedState = sessionStorage.getItem('spotify_auth_state');
  const userId = sessionStorage.getItem('spotify_auth_user');

  if (state !== storedState || !userId) {
    throw new Error('State mismatch or missing user ID');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    
    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      scope: data.scope
    };

    await storeSpotifyTokens(userId, tokens);
    
    // Clean up session storage
    sessionStorage.removeItem('spotify_auth_state');
    sessionStorage.removeItem('spotify_auth_user');

    console.log('✅ Spotify authentication completed successfully');
    return tokens;
  } catch (error) {
    console.error('Error handling Spotify callback:', error);
    throw error;
  }
};

// Get user profile
export const getSpotifyUserProfile = async (userId: string): Promise<SpotifyUserProfile | null> => {
  const tokens = await getValidSpotifyTokens(userId);
  if (!tokens) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Spotify user profile:', error);
    return null;
  }
};

// Disconnect Spotify account
export const disconnectSpotify = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'spotify_tokens', userId), {
      disconnected: true,
      disconnectedAt: new Date().toISOString()
    });
    console.log('✅ Spotify account disconnected');
  } catch (error) {
    console.error('Error disconnecting Spotify:', error);
    throw error;
  }
};