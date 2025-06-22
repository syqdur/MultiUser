import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Eye, Lock, Heart, MessageCircle, Calendar, User } from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserGallery, UserMediaItem } from '../services/userGalleryService';
import { InstagramGallery } from './InstagramGallery';
import { MediaModal } from './MediaModal';
import { useDarkMode } from '../hooks/useDarkMode';

interface PublicGalleryRouteProps {
  isDarkMode: boolean;
}

export const PublicGalleryRoute: React.FC<PublicGalleryRouteProps> = ({ isDarkMode }) => {
  const params = useParams();
  const uid = (params as any).uid;
  
  const [gallery, setGallery] = useState<UserGallery | null>(null);
  const [mediaItems, setMediaItems] = useState<UserMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!uid) {
      setError('Gallery ID not found');
      setLoading(false);
      return;
    }

    loadPublicGallery();
  }, [uid]);

  const loadPublicGallery = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load gallery settings
      const galleryDoc = await getDoc(doc(db, 'users', uid));
      
      if (!galleryDoc.exists()) {
        setError('Gallery not found');
        setLoading(false);
        return;
      }

      const galleryData = galleryDoc.data() as any;
      const gallerySettings = {
        id: uid,
        title: galleryData.displayName || 'Wedding Gallery',
        public: galleryData.publicGallery || false,
        theme: galleryData.theme || 'elegant',
        settings: {
          allowComments: galleryData.allowComments !== false,
          allowLikes: galleryData.allowLikes !== false,
          allowStories: galleryData.allowStories !== false,
          passwordProtected: galleryData.passwordProtected || false,
          password: galleryData.galleryPassword || null
        },
        ...galleryData
      } as UserGallery;

      setGallery(gallerySettings);

      // Check if gallery is public
      if (!gallerySettings.public) {
        setError('This gallery is private');
        setLoading(false);
        return;
      }

      // Check password protection
      if (gallerySettings.settings.passwordProtected && gallerySettings.settings.password) {
        setIsPasswordProtected(true);
        if (!isAuthenticated) {
          setLoading(false);
          return;
        }
      }

      // Load media items
      const mediaQuery = query(
        collection(db, `users/${uid}/media`),
        where('isPrivate', '==', false),
        orderBy('uploadedAt', 'desc')
      );

      const unsubscribe = onSnapshot(mediaQuery, (snapshot) => {
        const items: UserMediaItem[] = [];
        snapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data()
          } as UserMediaItem);
        });
        setMediaItems(items);
        setLoading(false);
      });

      return () => unsubscribe();

    } catch (err) {
      console.error('Error loading public gallery:', err);
      setError('Failed to load gallery');
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gallery) return;

    if (passwordInput === gallery.settings.password) {
      setIsAuthenticated(true);
      loadPublicGallery();
    } else {
      setError('Incorrect password');
    }
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Gallery Unavailable
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-md mx-auto p-8">
          <div className="text-center mb-8">
            <Lock className={`h-16 w-16 mx-auto mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`} />
            <h1 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Password Protected Gallery
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {gallery?.title || 'This gallery'} requires a password to view
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter gallery password"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              required
            />
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105"
            >
              Access Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!gallery) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {gallery.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Eye className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Public Gallery
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {mediaItems.length} Photos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {mediaItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No photos yet
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This gallery is waiting for beautiful memories to be shared
            </p>
          </div>
        ) : (
          <InstagramGallery
            mediaItems={mediaItems}
            onImageClick={openModal}
            isDarkMode={isDarkMode}
            isReadOnly={true}
          />
        )}
      </div>

      {/* Media Modal */}
      {modalOpen && (
        <MediaModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mediaItems={mediaItems}
          currentIndex={currentImageIndex}
          onPrevious={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
          onNext={() => setCurrentImageIndex(Math.min(mediaItems.length - 1, currentImageIndex + 1))}
          isDarkMode={isDarkMode}
          isReadOnly={true}
        />
      )}
    </div>
  );
};