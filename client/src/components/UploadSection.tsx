import React, { useState, useRef, useCallback } from 'react';
import { Plus, Camera, MessageSquare, Image, Video, Zap, Upload, X } from 'lucide-react';
import { VideoRecorder } from './VideoRecorder';

interface UploadSectionProps {
  onUpload: (files: FileList) => Promise<void>;
  onVideoUpload: (videoBlob: Blob) => Promise<void>;
  onNoteSubmit: (note: string) => Promise<void>;
  onAddStory: () => void;
  isUploading: boolean;
  progress: number;
  isDarkMode: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onUpload,
  onVideoUpload,
  onNoteSubmit,
  onAddStory,
  isUploading,
  progress,
  isDarkMode
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const fileArray = Array.from(selectedFiles);
      setPreviewFiles(fileArray);
      setShowPreview(true);
      setShowUploadOptions(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const fileArray = Array.from(droppedFiles);
      setPreviewFiles(fileArray);
      setShowPreview(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const confirmUpload = async () => {
    if (previewFiles.length > 0) {
      const fileList = new DataTransfer();
      previewFiles.forEach(file => fileList.items.add(file));
      await onUpload(fileList.files);
      setPreviewFiles([]);
      setShowPreview(false);
    }
  };

  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      await onNoteSubmit(noteText.trim());
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  const handleVideoRecorded = async (videoBlob: Blob) => {
    setShowVideoRecorder(false);
    await onVideoUpload(videoBlob);
  };

  return (
    <div 
      className={`p-4 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      } ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-4">
        {/* Neuer Beitrag Button */}
        <div className={`w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
          isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
        } ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
          <button
            onClick={() => setShowUploadOptions(true)}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          >
            <Plus className={`w-6 h-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            } ${isDragOver ? 'text-blue-500' : ''}`} />
          </button>
        </div>

        {/* Content Info */}
        <div className="flex-1">
          <h3 className={`font-bold text-sm mb-1 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Neuer Beitrag
          </h3>
          <p className={`text-xs transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {isDragOver ? 'Dateien hier ablegen...' : 'Teile deine schönsten Momente von der Hochzeit'}
          </p>
          {progress > 0 && (
            <div className={`w-full h-1 rounded-full mt-2 overflow-hidden transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Stories Button */}
        <button
          onClick={onAddStory}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isDarkMode
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg'
          }`}
          title="Story hinzufügen (24h)"
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Camera Icon */}
        <div className="flex items-center gap-2">
          <Camera className={`w-5 h-5 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>
      
      {/* Upload Options Modal */}
      {showUploadOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-sm w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-6 text-center transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Was möchtest du teilen?
            </h3>
            
            <div className="space-y-3">
              {/* Photo/Video Upload */}
              <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    📸 Foto oder Video
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Aus der Galerie auswählen
                  </p>
                </div>
              </label>

              {/* Video Recording */}
              <button
                onClick={() => {
                  setShowUploadOptions(false);
                  setShowVideoRecorder(true);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-red-600' : 'bg-red-500'
                }`}>
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    🎥 Video aufnehmen
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Direkt mit der Kamera
                  </p>
                </div>
              </button>

              {/* Note */}
              <button
                onClick={() => {
                  setShowUploadOptions(false);
                  setShowNoteInput(true);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className={`p-3 rounded-full transition-colors duration-300 ${
                  isDarkMode ? 'bg-pink-600' : 'bg-pink-500'
                }`}>
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    💌 Notiz
                  </h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Hinterlasse eine schöne Nachricht
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowUploadOptions(false)}
              className={`w-full mt-4 py-3 px-4 rounded-xl transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-md w-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              💌 Notiz hinterlassen
            </h3>
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Hinterlasse eine schöne Nachricht für das Brautpaar..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
                maxLength={500}
              />
              <div className={`text-xs text-right transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {noteText.length}/500
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteInput(false);
                    setNoteText('');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-colors"
                >
                  Senden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Recorder */}
      {showVideoRecorder && (
        <VideoRecorder
          onVideoRecorded={handleVideoRecorded}
          onClose={() => setShowVideoRecorder(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* File Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl p-6 max-w-4xl max-h-[90vh] w-full overflow-y-auto transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Dateien hochladen ({previewFiles.length})
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {previewFiles.map((file, index) => (
                <div key={index} className={`relative group rounded-lg overflow-hidden border-2 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                  ) : file.type.startsWith('video/') ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-32 object-cover"
                      muted
                      onLoadedData={(e) => URL.revokeObjectURL((e.target as HTMLVideoElement).src)}
                    />
                  ) : (
                    <div className={`w-full h-32 flex items-center justify-center ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => removePreviewFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent ${
                    isDarkMode ? 'text-white' : 'text-white'
                  }`}>
                    <p className="text-xs truncate">{file.name}</p>
                    <p className="text-xs opacity-75">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className={`flex-1 py-3 px-4 rounded-xl transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={confirmUpload}
                disabled={previewFiles.length === 0 || isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Wird hochgeladen...' : `${previewFiles.length} Datei(en) hochladen`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};