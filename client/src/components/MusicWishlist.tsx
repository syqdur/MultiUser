import React from 'react';
import { SpotifyPlaylistManager } from './SpotifyPlaylistManager';

interface MusicWishlistProps {
  isDarkMode: boolean;
}

export const MusicWishlist: React.FC<MusicWishlistProps> = ({ isDarkMode }) => {
  return <SpotifyPlaylistManager isDarkMode={isDarkMode} />;
};