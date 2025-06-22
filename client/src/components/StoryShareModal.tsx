import React, { useState } from 'react';
import { X, Share2, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter, FaTelegram, FaLinkedin } from 'react-icons/fa';
import { Story } from '../services/liveService';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  isDarkMode: boolean;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  story,
  isDarkMode
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !story) return null;

  const storyUrl = `${window.location.origin}/story/${story.id}`;
  const shareText = `Check out this wedding story by ${story.userName}! 💕`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(story.mediaUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const extension = story.mediaType === 'video' ? 'mp4' : 'jpg';
      const filename = `wedding-story-${story.userName}-${new Date().toISOString().split('T')[0]}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const sharePlatforms = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${storyUrl}`)}`
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: storyUrl, // Instagram doesn't support direct sharing, will copy link
      copyOnly: true
    },
    {
      name: 'Facebook',
      icon: FaFacebookF,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(storyUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}`
    }
  ];

  const handlePlatformShare = (platform: typeof sharePlatforms[0]) => {
    if (platform.copyOnly) {
      handleCopyLink();
      return;
    }
    
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md mx-4 rounded-xl shadow-xl transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <Share2 className={`w-5 h-5 transition-colors duration-300 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h2 className={`text-lg font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Story teilen
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-all duration-300 ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Preview */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {story.mediaType === 'video' ? (
                <video 
                  src={story.mediaUrl} 
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img 
                  src={story.mediaUrl} 
                  alt="Story" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Story von {story.userName}
              </p>
              <p className={`text-sm truncate transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {story.mediaType === 'video' ? 'Video' : 'Foto'} • {new Date(story.createdAt).toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                copied
                  ? isDarkMode
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500'
              }`}
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Lade...' : 'Download'}
            </button>
          </div>
        </div>

        {/* Platform Sharing */}
        <div className="p-6">
          <h3 className={`text-sm font-medium mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Auf Plattformen teilen
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            {sharePlatforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={() => handlePlatformShare(platform)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 hover:scale-105 ${platform.color} text-white`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </button>
              );
            })}
          </div>

          {/* Link Display */}
          <div className={`mt-4 p-3 rounded-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className={`text-xs font-medium mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Share-Link:
            </p>
            <p className={`text-xs break-all transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {storyUrl}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};