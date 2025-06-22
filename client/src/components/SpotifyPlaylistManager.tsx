import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Plus, 
  ExternalLink, 
  Settings, 
  Trash2, 
  Search,
  Play,
  Users,
  Heart,
  Crown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getUserSpotifyPlaylists,
  addPlaylistToGallery,
  subscribeToWeddingPlaylists,
  removePlaylistFromGallery,
  createWeddingPlaylist,
  updateWeddingPlaylist,
  SpotifyPlaylist,
  WeddingPlaylist
} from '../services/spotifyPlaylistService';
import { initiateSpotifyAuth, getValidSpotifyTokens, getSpotifyUserProfile } from '../services/spotifyAuthService';

interface SpotifyPlaylistManagerProps {
  isDarkMode: boolean;
}

export const SpotifyPlaylistManager: React.FC<SpotifyPlaylistManagerProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [weddingPlaylists, setWeddingPlaylists] = useState<WeddingPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    // Check Spotify connection
    checkSpotifyConnection();

    // Subscribe to wedding playlists
    const unsubscribe = subscribeToWeddingPlaylists(user.uid, setWeddingPlaylists);
    return unsubscribe;
  }, [user]);

  const checkSpotifyConnection = async () => {
    if (!user) return;

    try {
      const tokens = await getValidSpotifyTokens(user.uid);
      if (tokens) {
        setSpotifyConnected(true);
        loadSpotifyData();
      }
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
    }
  };

  const loadSpotifyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [playlists, profile] = await Promise.all([
        getUserSpotifyPlaylists(user.uid),
        getSpotifyUserProfile(user.uid)
      ]);
      
      setSpotifyPlaylists(playlists);
      setSpotifyProfile(profile);
    } catch (error) {
      console.error('Error loading Spotify data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSpotify = () => {
    if (!user) return;
    initiateSpotifyAuth(user.uid);
  };

  const handleAddPlaylist = async (spotifyPlaylist: SpotifyPlaylist, category: WeddingPlaylist['category']) => {
    if (!user) return;

    try {
      await addPlaylistToGallery(user.uid, spotifyPlaylist, category);
      setShowAddPlaylist(false);
    } catch (error) {
      console.error('Error adding playlist:', error);
    }
  };

  const handleRemovePlaylist = async (playlistId: string) => {
    try {
      await removePlaylistFromGallery(playlistId);
    } catch (error) {
      console.error('Error removing playlist:', error);
    }
  };

  const getCategoryIcon = (category: WeddingPlaylist['category']) => {
    switch (category) {
      case 'ceremony': return <Crown className="w-4 h-4" />;
      case 'reception': return <Users className="w-4 h-4" />;
      case 'party': return <Sparkles className="w-4 h-4" />;
      case 'background': return <Music className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: WeddingPlaylist['category']) => {
    switch (category) {
      case 'ceremony': return 'bg-purple-500';
      case 'reception': return 'bg-blue-500';
      case 'party': return 'bg-pink-500';
      case 'background': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!spotifyConnected) {
    return (
      <div className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`inline-flex p-4 rounded-full mb-4 ${
            isDarkMode ? 'bg-green-600' : 'bg-green-500'
          }`}>
            <Music className="w-8 h-8 text-white" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Mit Spotify verbinden
          </h3>
          <p className={`text-sm mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Verbinde dein Spotify-Konto um Playlists zu deiner Hochzeitsgalerie hinzuzufügen
          </p>
          <button
            onClick={handleConnectSpotify}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Mit Spotify verbinden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Spotify Playlists
              </h3>
              {spotifyProfile && (
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Verbunden als {spotifyProfile.display_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreatePlaylist(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Neue Playlist erstellen"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddPlaylist(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              title="Playlist hinzufügen"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wedding Playlists */}
        <div className="space-y-3">
          {weddingPlaylists.length === 0 ? (
            <div className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Playlists hinzugefügt</p>
              <p className="text-sm">Klicke auf das Plus-Symbol um zu beginnen</p>
            </div>
          ) : (
            weddingPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {playlist.imageUrl ? (
                    <img
                      src={playlist.imageUrl}
                      alt={playlist.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      getCategoryColor(playlist.category)
                    }`}>
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {playlist.name}
                    </h4>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      getCategoryColor(playlist.category)
                    } text-white`}>
                      {getCategoryIcon(playlist.category)}
                      <span className="capitalize">{playlist.category}</span>
                    </div>
                  </div>
                  <p className={`text-sm truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {playlist.trackCount} Titel
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={playlist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                    title="In Spotify öffnen"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleRemovePlaylist(playlist.id)}
                    className={`p-2 rounded-lg transition-colors text-red-500 ${
                      isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                    }`}
                    title="Entfernen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Playlist Modal */}
      {showAddPlaylist && (
        <AddPlaylistModal
          isDarkMode={isDarkMode}
          spotifyPlaylists={spotifyPlaylists}
          onClose={() => setShowAddPlaylist(false)}
          onAdd={handleAddPlaylist}
          loading={loading}
        />
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <CreatePlaylistModal
          isDarkMode={isDarkMode}
          onClose={() => setShowCreatePlaylist(false)}
          onCreate={async (name, description, category, isPublic) => {
            if (!user) return;
            await createWeddingPlaylist(user.uid, name, description, category, isPublic);
            setShowCreatePlaylist(false);
            loadSpotifyData();
          }}
        />
      )}
    </div>
  );
};

// Add Playlist Modal Component
interface AddPlaylistModalProps {
  isDarkMode: boolean;
  spotifyPlaylists: SpotifyPlaylist[];
  onClose: () => void;
  onAdd: (playlist: SpotifyPlaylist, category: WeddingPlaylist['category']) => void;
  loading: boolean;
}

const AddPlaylistModal: React.FC<AddPlaylistModalProps> = ({
  isDarkMode,
  spotifyPlaylists,
  onClose,
  onAdd,
  loading
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WeddingPlaylist['category']>('custom');

  const categories = [
    { id: 'ceremony', label: 'Zeremonie', icon: Crown },
    { id: 'reception', label: 'Empfang', icon: Users },
    { id: 'party', label: 'Party', icon: Sparkles },
    { id: 'background', label: 'Hintergrund', icon: Music },
    { id: 'custom', label: 'Benutzerdefiniert', icon: Heart }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Playlist hinzufügen
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Kategorie auswählen
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? isDarkMode
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-blue-500 border-blue-400 text-white'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playlist List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className={`mt-2 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Lade Playlists...
              </p>
            </div>
          ) : spotifyPlaylists.length === 0 ? (
            <div className={`text-center py-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keine Playlists gefunden</p>
            </div>
          ) : (
            spotifyPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {playlist.images[0] ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {playlist.name}
                  </h4>
                  <p className={`text-sm truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {playlist.tracks.total} Titel • {playlist.owner.display_name}
                  </p>
                </div>

                <button
                  onClick={() => onAdd(playlist, selectedCategory)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Create Playlist Modal Component
interface CreatePlaylistModalProps {
  isDarkMode: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, category: WeddingPlaylist['category'], isPublic: boolean) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isDarkMode,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WeddingPlaylist['category']>('custom');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'ceremony', label: 'Zeremonie' },
    { id: 'reception', label: 'Empfang' },
    { id: 'party', label: 'Party' },
    { id: 'background', label: 'Hintergrund' },
    { id: 'custom', label: 'Benutzerdefiniert' }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate(name, description, category, isPublic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl p-6 max-w-md w-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Neue Playlist erstellen
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Hochzeitsfeier Musik"
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Beschreibung (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung der Playlist..."
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Kategorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WeddingPlaylist['category'])}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label
              htmlFor="isPublic"
              className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Öffentliche Playlist (andere können sie finden und folgen)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-colors"
            >
              {loading ? 'Erstelle...' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};