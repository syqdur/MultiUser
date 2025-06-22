import React, { useState, useEffect } from 'react';
import { Globe, Lock, Eye, EyeOff, Copy, ExternalLink, Settings, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { 
  enablePublicSharing, 
  disablePublicSharing, 
  updatePublicGallerySettings,
  getPublicGalleryStats,
  generateShareableLink,
  PublicGallerySettings,
  PublicGalleryStats
} from '../services/publicGalleryService';

interface PublicSharingPanelProps {
  isDarkMode: boolean;
}

export const PublicSharingPanel: React.FC<PublicSharingPanelProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);
  const [settings, setSettings] = useState<PublicGallerySettings>({
    isPublic: false,
    passwordProtected: false,
    allowComments: true,
    allowLikes: true
  });
  const [stats, setStats] = useState<PublicGalleryStats | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadCurrentSettings();
      loadStats();
    }
  }, [user]);

  const loadCurrentSettings = async () => {
    if (!user) return;
    
    try {
      // Load settings from user document
      const userDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
        getDoc(doc(import('../config/firebase').then(m => m.db), 'users', user.uid))
      );
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const currentSettings: PublicGallerySettings = {
          isPublic: data.publicGallery || false,
          passwordProtected: data.passwordProtected || false,
          password: data.galleryPassword || '',
          allowComments: data.allowPublicComments !== false,
          allowLikes: data.allowPublicLikes !== false,
          customMessage: data.customMessage || ''
        };
        
        setSettings(currentSettings);
        setIsPublic(currentSettings.isPublic);
        
        if (data.publicUrl) {
          setPublicUrl(data.publicUrl);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const galleryStats = await getPublicGalleryStats(user.uid);
      setStats(galleryStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleTogglePublic = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      if (isPublic) {
        await disablePublicSharing(user.uid);
        setIsPublic(false);
        setPublicUrl('');
      } else {
        const url = await enablePublicSharing(user.uid, settings);
        setIsPublic(true);
        setPublicUrl(url);
      }
    } catch (error) {
      console.error('Error toggling public sharing:', error);
      alert('Failed to update sharing settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<PublicGallerySettings>) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updatePublicGallerySettings(user.uid, newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      if (isPublic) {
        // Regenerate URL if settings changed
        const url = generateShareableLink(user.uid, newSettings.customMessage);
        setPublicUrl(url);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  const handleOpenPublicGallery = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <div className={`rounded-2xl border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Public Gallery Sharing
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your wedding gallery with guests and family
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleTogglePublic}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isPublic
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isPublic ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {isPublic ? 'Disable' : 'Enable'} Public Sharing
          </button>
        </div>
      </div>

      {/* Status and URL */}
      {isPublic && publicUrl && (
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-green-500" />
            <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
              Gallery is publicly accessible
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <button
              onClick={handleCopyUrl}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleOpenPublicGallery}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              View
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className={`border rounded-lg p-4 mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h4 className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Privacy Settings
          </h4>
          
          <div className="space-y-4">
            {/* Password Protection */}
            <div className="flex items-center justify-between">
              <div>
                <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Password Protection
                </label>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Require password to view gallery
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.passwordProtected}
                  onChange={(e) => handleUpdateSettings({ passwordProtected: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Password Input */}
            {settings.passwordProtected && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gallery Password
                </label>
                <input
                  type="password"
                  value={settings.password || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  onBlur={(e) => handleUpdateSettings({ password: e.target.value })}
                  placeholder="Enter password for gallery access"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            )}

            {/* Interaction Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Allow Comments
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowComments}
                    onChange={(e) => handleUpdateSettings({ allowComments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Allow Likes
                  </label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowLikes}
                    onChange={(e) => handleUpdateSettings({ allowLikes: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Custom Welcome Message
              </label>
              <textarea
                value={settings.customMessage || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                onBlur={(e) => handleUpdateSettings({ customMessage: e.target.value })}
                placeholder="Welcome to our wedding gallery! Feel free to browse and leave comments."
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {isPublic && stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.views}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Views
            </div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.uniqueVisitors}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Unique Visitors
            </div>
          </div>
          
          <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.lastViewed ? new Date(stats.lastViewed).toLocaleDateString() : '-'}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last Viewed
            </div>
          </div>
        </div>
      )}
    </div>
  );
};