import React, { useState } from 'react';
import { Camera, User, FileText, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
  userId: string;
  isDarkMode: boolean;
}

interface UserProfile {
  displayName: string;
  bio: string;
  profilePictureUrl: string;
  theme: 'wedding' | 'vacation' | 'birthday';
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userId,
  isDarkMode
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    profilePictureUrl: '',
    theme: 'wedding'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string>('');

  if (!isOpen) return null;

  const themes = [
    {
      id: 'wedding' as const,
      name: '💕 Wedding',
      description: 'Romantische Farbverläufe in Rosa, Lila und Gold',
      colors: 'from-rose-400 via-pink-500 to-purple-500',
      bgColors: 'from-pink-50 via-rose-50 to-purple-50',
      textColor: 'text-pink-800',
      icon: '💕',
      features: ['Elegante Farbverläufe', 'Romantische Akzente', 'Warme Töne']
    },
    {
      id: 'vacation' as const,
      name: '🌊 Vacation',
      description: 'Tropische Farben in Cyan, Türkis und Meeresblau',
      colors: 'from-cyan-400 via-teal-500 to-blue-500',
      bgColors: 'from-cyan-50 via-teal-50 to-blue-50',
      textColor: 'text-cyan-800',
      icon: '🌊',
      features: ['Meeresfarben', 'Entspannte Atmosphäre', 'Frische Töne']
    },
    {
      id: 'birthday' as const,
      name: '🎉 Birthday',
      description: 'Festliche Farben in Orange, Gelb und Rot',
      colors: 'from-yellow-400 via-orange-500 to-red-500',
      bgColors: 'from-yellow-50 via-orange-50 to-red-50',
      textColor: 'text-orange-800',
      icon: '🎉',
      features: ['Lebendige Farben', 'Partyatmosphäre', 'Energiegeladene Töne']
    }
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select a valid image file (JPEG, PNG)' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const fileName = `profile_${userId}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${userId}/profile/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setProfile(prev => ({ ...prev, profilePictureUrl: downloadURL }));
      setErrors({ ...errors, image: '' });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setErrors({ ...errors, image: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.displayName.trim()) {
      newErrors.displayName = 'Profile name is required';
    }

    if (profile.bio.length > 300) {
      newErrors.bio = 'Bio must be 300 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Complete Your Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Picture Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 mx-auto">
                <img
                  src={previewImage || profile.profilePictureUrl || 'https://via.placeholder.com/96x96/cccccc/666666?text=👤'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Camera className="w-4 h-4" />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-red-500 text-sm mt-2">{errors.image}</p>
            )}
            <p className={`text-sm mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Upload a profile picture (JPEG, PNG - max 5MB)
            </p>
          </div>

          {/* Profile Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <User className="w-4 h-4 inline mr-2" />
              Profile Name *
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.displayName ? 'border-red-500' : ''}`}
              placeholder="Enter your name"
              maxLength={50}
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              <FileText className="w-4 h-4 inline mr-2" />
              Bio ({profile.bio.length}/300)
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Tell people about yourself and this gallery..."
              maxLength={300}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Theme Selection */}
          <div>
            <label className={`block text-lg font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ✨ Wähle dein Gallery-Theme
            </label>
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Jedes Theme hat einzigartige Farben, Farbverläufe und visuelle Effekte
            </p>
            <div className="grid gap-3">
              {themes.map((theme) => (
                <label
                  key={theme.id}
                  className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-102 ${
                    profile.theme === theme.id
                      ? `border-transparent bg-gradient-to-r ${theme.bgColors} shadow-lg ring-2 ring-offset-2 ring-blue-400`
                      : isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={profile.theme === theme.id}
                    onChange={(e) => setProfile(prev => ({ ...prev, theme: e.target.value as any }))}
                    className="sr-only"
                  />
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${theme.colors} mr-4 flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl">
                      {theme.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {theme.name}
                    </h3>
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {theme.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {theme.features.map((feature, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.bgColors} ${theme.textColor} font-medium`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  {profile.theme === theme.id && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r ${theme.colors} shadow-lg`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              // Create a basic profile with default values if user skips
              const defaultProfile = {
                displayName: 'Gallery User',
                bio: 'Welcome to my gallery!',
                profilePictureUrl: '',
                theme: 'wedding' as const
              };
              onComplete(defaultProfile);
            }}
            className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Skip for Now
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${
              profile.theme === 'wedding' 
                ? 'from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                : profile.theme === 'vacation'
                ? 'from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                : 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
            } disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg`}
          >
            {isUploading ? 'Wird hochgeladen...' : '🚀 Gallery erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
};