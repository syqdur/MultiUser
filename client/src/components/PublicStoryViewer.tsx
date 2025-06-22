import React, { useState, useEffect } from 'react';
import { Share2, Download, ExternalLink } from 'lucide-react';
import { Story } from '../services/liveService';
import { StoryShareModal } from './StoryShareModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface PublicStoryViewerProps {
  storyId: string;
  isDarkMode: boolean;
}

export const PublicStoryViewer: React.FC<PublicStoryViewerProps> = ({
  storyId,
  isDarkMode
}) => {
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadPublicStory();
  }, [storyId]);

  const loadPublicStory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to find story in all user collections
      // This is a simplified approach - in production, you might want to store a story lookup table
      const users = ['RCislkICUld9S0VQsqXtFLVs5Nk2']; // Add more user IDs as needed
      
      for (const userId of users) {
        try {
          const storyRef = doc(db, `users/${userId}/stories`, storyId);
          const storySnap = await getDoc(storyRef);
          
          if (storySnap.exists()) {
            const storyData = { id: storySnap.id, ...storySnap.data() } as Story;
            
            // Check if story is still active (not expired)
            const expiresAt = new Date(storyData.expiresAt);
            const now = new Date();
            
            if (expiresAt > now) {
              setStory(storyData);
              return;
            } else {
              setError('Diese Story ist abgelaufen und nicht mehr verfügbar.');
              return;
            }
          }
        } catch (err) {
          // Continue to next user if this one fails
          continue;
        }
      }
      
      setError('Story nicht gefunden oder nicht mehr verfügbar.');
    } catch (err) {
      console.error('Error loading public story:', err);
      setError('Fehler beim Laden der Story.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (userName: string) => {
    const avatars = [
      'https://images.unsplash.com/photo-1494790108755-2616b612b167?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    ];
    return avatars[userName.length % avatars.length];
  };

  const handleDownload = async () => {
    if (!story) return;
    
    try {
      const response = await fetch(story.mediaUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = story.mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `wedding-story-${story.userName}-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Gerade eben';
    if (diffInHours === 1) return 'Vor 1 Stunde';
    if (diffInHours < 24) return `Vor ${diffInHours} Stunden`;
    return date.toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center">
          <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${
            isDarkMode 
              ? 'border-gray-600 border-t-blue-400' 
              : 'border-gray-300 border-t-blue-600'
          }`}></div>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Story wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Story nicht verfügbar
          </h1>
          <p className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <a
            href="/"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            Zur Galerie
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={getAvatarUrl(story.userName)}
                  alt={story.userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Story von {story.userName}
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatTimeAgo(story.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Share2 className="w-4 h-4" />
                Teilen
              </button>
              <button
                onClick={handleDownload}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`rounded-xl overflow-hidden shadow-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="aspect-[9/16] max-h-[80vh] bg-black relative">
            {story.mediaType === 'image' ? (
              <img
                src={story.mediaUrl}
                alt="Wedding Story"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={story.mediaUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                muted
                playsInline
              />
            )}
          </div>
          
          {/* Story Info */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Wedding Story
                </p>
                <p className={`text-xs transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {story.views.length} Aufrufe
                </p>
              </div>
              <a
                href="/"
                className={`text-sm font-medium transition-colors duration-300 hover:underline ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Mehr Stories ansehen →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Story Share Modal */}
      <StoryShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        story={story}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};