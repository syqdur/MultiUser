import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Sun, Moon, LogOut, Settings } from 'lucide-react';
import { UploadSection } from './UploadSection';
import { InstagramGallery } from './InstagramGallery';
import { MediaModal } from './MediaModal';
import { AdminPanel } from './AdminPanel';
import { ProfileHeader } from './ProfileHeader';
import { UnderConstructionPage } from './UnderConstructionPage';
import { StoriesBar } from './StoriesBar';
import { StoriesViewer } from './StoriesViewer';
import { StoryUploadModal } from './StoryUploadModal';
import { TabNavigation } from './TabNavigation';
import { LiveUserIndicator } from './LiveUserIndicator';
import { SpotifyCallback } from './SpotifyCallback';
import { MusicWishlist } from './MusicWishlist';
import { Timeline } from './Timeline';
import { PostWeddingRecap } from './PostWeddingRecap';
import { PublicRecapPage } from './PublicRecapPage';
import { PublicGalleryRoute } from './PublicGalleryRoute';
import { AdminLoginModal } from './AdminLoginModal';
import { AdminPasswordSetup } from './AdminPasswordSetup';
import { FirebasePermissionsBanner } from './FirebasePermissionsBanner';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { MediaItem, Comment, Like } from '../types';
import {
  uploadUserFiles,
  uploadUserVideoBlob,
  loadUserGallery,
  deleteUserMediaItem,
  loadUserComments,
  addUserComment,
  deleteUserComment,
  loadUserLikes,
  toggleUserLike,
  addUserNote,
  editUserNote
} from '../services/userFirebaseService';
import { UserMediaItem } from '../services/userGalleryService';
import { setupAdminPassword, checkAdminPasswordSetup } from '../services/adminService';
import { subscribeSiteStatus, SiteStatus } from '../services/siteStatusService';
import {
  subscribeStories,
  subscribeAllStories,
  addStory,
  markStoryAsViewed,
  deleteStory,
  cleanupExpiredStories,
  Story
} from '../services/liveService';

interface GalleryAppProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const GalleryApp: React.FC<GalleryAppProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const [mediaItems, setMediaItems] = useState<UserMediaItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [siteStatus, setSiteStatus] = useState<SiteStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStoriesViewer, setShowStoriesViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'music' | 'timeline'>('gallery');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPasswordSetup, setShowAdminPasswordSetup] = useState(false);
  const [needsAdminPasswordSetup, setNeedsAdminPasswordSetup] = useState(false);
  const [hasFirebasePermissionErrors, setHasFirebasePermissionErrors] = useState(false);

  // Check if we're on the Spotify callback page
  const isSpotifyCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  };

  // Check if we're on a public gallery route
  const isPublicGalleryRoute = () => {
    return window.location.pathname.startsWith('/p/');
  };

  // Check if we're on the Public Recap page
  const isPublicRecap = () => {
    return window.location.pathname === '/recap';
  };

  // Check if we're on the Post-Wedding Recap page (admin)
  const isPostWeddingRecap = () => {
    return window.location.pathname === '/admin/post-wedding-recap';
  };

  // Subscribe to site status changes
  useEffect(() => {
    const unsubscribe = subscribeSiteStatus((status) => {
      setSiteStatus(status);
    });

    return unsubscribe;
  }, []);

  // Subscribe to stories when user is logged in
  useEffect(() => {
    if (!user || !siteStatus || siteStatus.isUnderConstruction) return;

    // Subscribe to stories (admin sees all, users see only active)
    const unsubscribeStories = isAdmin 
      ? subscribeAllStories(setStories)
      : subscribeStories(user.uid, setStories, (error) => {
          if (error?.code === 'permission-denied') {
            setHasFirebasePermissionErrors(true);
          }
        });

    // Cleanup expired stories periodically
    const cleanupInterval = setInterval(() => {
      cleanupExpiredStories();
    }, 60000); // Check every minute

    return () => {
      clearInterval(cleanupInterval);
      unsubscribeStories();
    };
  }, [user, siteStatus, isAdmin]);

  useEffect(() => {
    if (!user) return;

    // Check if admin password setup is needed
    checkAdminPasswordSetup(user.uid).then(isSetup => {
      if (!isSetup) {
        setNeedsAdminPasswordSetup(true);
        setShowAdminPasswordSetup(true);
      }
    });

    if (!siteStatus || siteStatus.isUnderConstruction) return;

    const unsubscribeGallery = loadUserGallery(user.uid, setMediaItems, (error) => {
      if (error?.code === 'permission-denied') {
        setHasFirebasePermissionErrors(true);
      }
    });
    const unsubscribeComments = loadUserComments(user.uid, setComments, (error) => {
      if (error?.code === 'permission-denied') {
        setHasFirebasePermissionErrors(true);
      }
    });
    const unsubscribeLikes = loadUserLikes(user.uid, setLikes, (error) => {
      if (error?.code === 'permission-denied') {
        setHasFirebasePermissionErrors(true);
      }
    });

    return () => {
      unsubscribeGallery();
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [user, siteStatus]);

  // Auto-logout when window/tab is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear admin status when page is closed
      if (isAdmin) {
        localStorage.removeItem('admin_status');
      }
    };

    // Check if admin status is stored in localStorage (for page refreshes)
    const storedAdminStatus = localStorage.getItem('admin_status');
    if (storedAdminStatus) {
      setIsAdmin(true);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAdmin]);

  const handleUpload = async (files: FileList) => {
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const items = await uploadUserFiles(files, user.uid, user.displayName || user.email || 'Anonymous', (progress: number) => {
        setUploadProgress(progress);
      });
      setStatus(`✅ ${items.length} ${items.length === 1 ? 'Datei' : 'Dateien'} erfolgreich hochgeladen!`);
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('❌ Fehler beim Hochladen. Bitte versuche es erneut.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (videoBlob: Blob) => {
    if (!user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadUserVideoBlob(videoBlob, user.uid, user.displayName || user.email || 'Anonymous', (progress: number) => {
        setUploadProgress(progress);
      });
      setStatus('✅ Video erfolgreich hochgeladen!');
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Video upload error:', error);
      setStatus('❌ Fehler beim Hochladen des Videos. Bitte versuche es erneut.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleNoteSubmit = async (note: string) => {
    if (!user) return;

    setIsUploading(true);

    try {
      await addUserNote(note, user.uid, user.displayName || user.email || 'Anonymous');
      setStatus('✅ Notiz erfolgreich hinzugefügt!');
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Note submission error:', error);
      setStatus('❌ Fehler beim Hinzufügen der Notiz. Bitte versuche es erneut.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditNote = async (item: UserMediaItem, newText: string) => {
    try {
      await editUserNote(item.id, newText, user?.uid || '');
      setStatus('✅ Notiz erfolgreich bearbeitet!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Note edit error:', error);
      setStatus('❌ Fehler beim Bearbeiten der Notiz.');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleDelete = async (item: UserMediaItem) => {
    try {
      await deleteUserMediaItem(item, user?.uid || '');
      setStatus('✅ Element erfolgreich gelöscht!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setStatus('❌ Fehler beim Löschen des Elements.');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleStoryUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);

    try {
      await addStory(file, user.displayName || user.email || 'Anonymous', user.uid);
      setStatus('✅ Story erfolgreich hochgeladen!');
      setTimeout(() => setStatus(''), 3000);
      setShowStoryUpload(false);
    } catch (error) {
      console.error('Story upload error:', error);
      setStatus('❌ Fehler beim Hochladen der Story. Bitte versuche es erneut.');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewStory = (storyIndex: number) => {
    setCurrentStoryIndex(storyIndex);
    setShowStoriesViewer(true);
  };

  const handleStoryViewed = async (storyId: string) => {
    if (!user) return;
    await markStoryAsViewed(storyId, user.uid);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      setStatus('✅ Story erfolgreich gelöscht!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Error deleting story:', error);
      setStatus('❌ Fehler beim Löschen der Story.');
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
  };

  const handleAdminLogin = (username: string) => {
    setIsAdmin(true);
    localStorage.setItem('admin_status', 'true');
    setShowAdminLogin(false);
    
    // Show welcome message for different admins
    if (username === "Ehepaar") {
      setTimeout(() => {
        alert('🎉 Willkommen! Du hast jetzt Zugriff auf die Post-Hochzeits-Zusammenfassung.\n\n💕 Klicke auf den Sparkles-Button (✨) um loszulegen!');
      }, 500);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('admin_status');
  };

  const handleAdminPasswordSave = async (password: string) => {
    if (!user) return;
    
    try {
      const displayName = user.displayName || user.email || 'Anonymous';
      await setupAdminPassword(user.uid, password, displayName);
      setNeedsAdminPasswordSetup(false);
      setShowAdminPasswordSetup(false);
    } catch (error) {
      console.error('Error setting up admin password:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleAdminLogout(); // Also clear admin status
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show Public Gallery Route if accessing a public gallery
  if (isPublicGalleryRoute()) {
    return <PublicGalleryRoute isDarkMode={isDarkMode} />;
  }

  // Show Spotify callback handler if on callback page
  if (isSpotifyCallback()) {
    return <SpotifyCallback isDarkMode={isDarkMode} />;
  }

  // Show Public Recap Page if on that route
  if (isPublicRecap()) {
    return <PublicRecapPage isDarkMode={isDarkMode} />;
  }

  // Show Post-Wedding Recap if on that route (admin only)
  if (isPostWeddingRecap()) {
    // Only allow access if admin
    if (!isAdmin) {
      return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Zugriff verweigert
            </h1>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Diese Seite ist nur für Administratoren zugänglich.
            </p>
            <button
              onClick={() => setShowAdminLogin(true)}
              className="mt-4 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"
            >
              Anmelden
            </button>
          </div>

          <AdminLoginModal
            isOpen={showAdminLogin}
            onClose={() => setShowAdminLogin(false)}
            onLogin={handleAdminLogin}
            isDarkMode={isDarkMode}
          />
        </div>
      );
    }

    return (
      <PostWeddingRecap
        isDarkMode={isDarkMode}
        mediaItems={mediaItems}
        isAdmin={isAdmin}
        userName={user?.displayName || user?.email || 'Anonymous'}
      />
    );
  }

  // Show site status message if under construction
  if (siteStatus?.isUnderConstruction) {
    return (
      <UnderConstructionPage
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        siteStatus={siteStatus}
        isAdmin={isAdmin}
        onToggleAdmin={(admin) => {
          if (admin) {
            setShowAdminLogin(true);
          } else {
            handleAdminLogout();
          }
        }}
      />
    );
  }

  // Main gallery interface
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-lg bg-opacity-90 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ProfileHeader isDarkMode={isDarkMode} isAdmin={isAdmin} />
              <LiveUserIndicator 
                currentUser={user?.displayName || user?.email || 'Anonymous'} 
                isDarkMode={isDarkMode} 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className="max-w-md mx-auto px-4 py-2">
          <div className={`p-3 rounded-lg text-center font-medium ${
            status.includes('✅') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {status}
          </div>
        </div>
      )}

      {/* Firebase Permissions Banner */}
      {hasFirebasePermissionErrors && (
        <div className="max-w-md mx-auto px-4 py-2">
          <FirebasePermissionsBanner isDarkMode={isDarkMode} />
        </div>
      )}

      {/* Stories Bar */}
      <div className="max-w-md mx-auto px-4 py-4">
        <StoriesBar
          stories={stories}
          currentUser={user?.displayName || user?.email || 'Anonymous'}
          onAddStory={() => setShowStoryUpload(true)}
          onViewStory={handleViewStory}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-md mx-auto px-4">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Content based on active tab */}
      <div className="max-w-md mx-auto px-4 pb-4">
        {activeTab === 'gallery' && (
          <>
            {/* Upload Section */}
            <UploadSection
              onUpload={handleUpload}
              onVideoUpload={handleVideoUpload}
              onNoteSubmit={handleNoteSubmit}
              onAddStory={() => setShowStoryUpload(true)}
              isUploading={isUploading}
              progress={uploadProgress}
              isDarkMode={isDarkMode}
            />

            {/* Gallery */}
            <InstagramGallery
              items={mediaItems}
              onItemClick={openModal}
              onDelete={isAdmin ? (item: MediaItem) => handleDelete(item as UserMediaItem) : undefined}
              onEditNote={isAdmin ? (item: MediaItem, newText: string) => handleEditNote(item as UserMediaItem, newText) : undefined}
              isAdmin={isAdmin}
              comments={comments}
              likes={likes}
              onAddComment={(mediaId, text) => addUserComment(mediaId, text, user?.displayName || user?.email || 'Anonymous', user?.uid || '', user?.uid || '')}
              onDeleteComment={(commentId) => deleteUserComment(commentId, user?.uid || '')}
              onToggleLike={(mediaId) => toggleUserLike(mediaId, user?.uid || '', user?.displayName || user?.email || 'Anonymous', user?.uid || '')}
              userName={user?.displayName || user?.email || 'Anonymous'}
              isDarkMode={isDarkMode}
            />
          </>
        )}

        {activeTab === 'music' && (
          <div className="space-y-6">
            <MusicWishlist isDarkMode={isDarkMode} />
          </div>
        )}

        {activeTab === 'timeline' && (
          <Timeline
            isDarkMode={isDarkMode}
            userName={user?.displayName || user?.email || 'Anonymous'}
            isAdmin={isAdmin}
            userId={user?.uid}
          />
        )}
      </div>

      {/* Admin Access Button - Always visible */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => isAdmin ? handleAdminLogout() : setShowAdminLogin(true)}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? isAdmin
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : isAdmin
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}
          title={isAdmin ? "Admin-Modus verlassen" : "Admin-Modus"}
        >
          {isAdmin ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM4 10V7a8 8 0 1116 0v3" />
            </svg>
          )}
        </button>
      </div>

      {/* Admin Panel (if admin) */}
      {isAdmin && (
        <AdminPanel
          isDarkMode={isDarkMode}
          isAdmin={isAdmin}
          onToggleAdmin={handleAdminLogout}
          mediaItems={mediaItems}
          siteStatus={siteStatus || undefined}
        />
      )}

      {/* Modals */}
      <MediaModal
        isOpen={modalOpen}
        items={mediaItems}
        currentIndex={currentImageIndex}
        onClose={() => setModalOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
        comments={comments}
        likes={likes}
        onAddComment={(mediaId, text) => addUserComment(mediaId, text, user?.displayName || user?.email || 'Anonymous', user?.uid || '', user?.uid || '')}
        onDeleteComment={(commentId) => deleteUserComment(commentId, user?.uid || '')}
        onToggleLike={(mediaId) => toggleUserLike(mediaId, user?.uid || '', user?.displayName || user?.email || 'Anonymous', user?.uid || '')}
        userName={user?.displayName || user?.email || 'Anonymous'}
        isAdmin={isAdmin}
        isDarkMode={isDarkMode}
      />

      <StoriesViewer
        isOpen={showStoriesViewer}
        stories={stories}
        initialStoryIndex={currentStoryIndex}
        currentUser={user?.displayName || user?.email || 'Anonymous'}
        onClose={() => setShowStoriesViewer(false)}
        onStoryViewed={handleStoryViewed}
        onDeleteStory={handleDeleteStory}
        isAdmin={isAdmin}
        isDarkMode={isDarkMode}
      />

      <StoryUploadModal
        isOpen={showStoryUpload}
        onClose={() => setShowStoryUpload(false)}
        onUpload={handleStoryUpload}
        isDarkMode={isDarkMode}
      />

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        isDarkMode={isDarkMode}
      />

      <AdminPasswordSetup
        isOpen={showAdminPasswordSetup}
        onClose={() => setShowAdminPasswordSetup(false)}
        onSave={handleAdminPasswordSave}
        isDarkMode={isDarkMode}
        userDisplayName={user?.displayName || user?.email || 'Anonymous'}
      />
    </div>
  );
};