import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Download, Settings, Image, Video, Music, Sparkles, Upload, Check } from 'lucide-react';
import { UserMediaItem } from '../services/userGalleryService';

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: UserMediaItem[];
  isDarkMode: boolean;
  onGenerateVideo: (config: VideoConfig) => Promise<string>;
}

export interface VideoConfig {
  selectedMedia: UserMediaItem[];
  duration: number;
  transition: 'fade' | 'slide' | 'zoom';
  music?: string;
  title?: string;
  subtitle?: string;
  theme: 'elegant' | 'modern' | 'romantic' | 'minimal';
}

export const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  mediaItems,
  isDarkMode,
  onGenerateVideo
}) => {
  const [step, setStep] = useState<'selection' | 'configuration' | 'generation' | 'complete'>('selection');
  const [selectedMedia, setSelectedMedia] = useState<UserMediaItem[]>([]);
  const [config, setConfig] = useState<VideoConfig>({
    selectedMedia: [],
    duration: 30,
    transition: 'fade',
    theme: 'elegant'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('selection');
      setSelectedMedia([]);
      setGeneratedVideoUrl(null);
      setProgress(0);
    }
  }, [isOpen]);

  const handleMediaSelect = (media: UserMediaItem) => {
    setSelectedMedia(prev => {
      const isSelected = prev.find(item => item.id === media.id);
      if (isSelected) {
        return prev.filter(item => item.id !== media.id);
      } else {
        return [...prev, media];
      }
    });
  };

  const handleNext = () => {
    if (step === 'selection' && selectedMedia.length > 0) {
      setConfig(prev => ({ ...prev, selectedMedia }));
      setStep('configuration');
    } else if (step === 'configuration') {
      setStep('generation');
      generateVideo();
    }
  };

  const generateVideo = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const videoUrl = await onGenerateVideo(config);
      
      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedVideoUrl(videoUrl);
      setStep('complete');
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      link.download = `wedding-recap-${Date.now()}.mp4`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Wedding Recap Video
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {['selection', 'configuration', 'generation', 'complete'].map((s, index) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s 
                      ? 'bg-pink-500 text-white' 
                      : index < ['selection', 'configuration', 'generation', 'complete'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index < ['selection', 'configuration', 'generation', 'complete'].indexOf(step) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 ${
                      index < ['selection', 'configuration', 'generation', 'complete'].indexOf(step)
                        ? 'bg-green-500'
                        : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {step === 'selection' && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Photos & Videos ({selectedMedia.length} selected)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((media) => (
                  <div
                    key={media.id}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedMedia.find(item => item.id === media.id)
                        ? 'border-pink-500 ring-2 ring-pink-500 ring-opacity-50'
                        : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMediaSelect(media)}
                  >
                    {media.type === 'video' ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <img
                        src={media.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    {selectedMedia.find(item => item.id === media.id) && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'configuration' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Video Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Video Duration
                  </label>
                  <select
                    value={config.duration}
                    onChange={(e) => setConfig(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Transition Style
                  </label>
                  <select
                    value={config.transition}
                    onChange={(e) => setConfig(prev => ({ ...prev, transition: e.target.value as any }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                    <option value="zoom">Zoom</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Theme
                  </label>
                  <select
                    value={config.theme}
                    onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as any }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="elegant">Elegant</option>
                    <option value="modern">Modern</option>
                    <option value="romantic">Romantic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.title || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Our Wedding Day"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'generation' && (
            <div className="text-center py-8">
              <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'} animate-pulse`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Generating Your Video
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Creating a beautiful recap from your selected memories...
              </p>
              
              <div className={`w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {step === 'complete' && generatedVideoUrl && (
            <div className="text-center py-8">
              <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Video Generated Successfully!
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your wedding recap video is ready to download and share.
              </p>
              
              <div className="space-y-4">
                <video
                  src={generatedVideoUrl}
                  controls
                  className="w-full max-w-md mx-auto rounded-lg"
                />
                
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Download Video
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'selection' || step === 'configuration') && (
          <div className={`flex items-center justify-between p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={step === 'selection' ? onClose : () => setStep('selection')}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {step === 'selection' ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={step === 'selection' && selectedMedia.length === 0}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 'selection' ? 'Continue' : 'Generate Video'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};