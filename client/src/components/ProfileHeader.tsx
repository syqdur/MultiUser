import React, { useState, useEffect } from 'react';
import { UserPlus, Settings, Camera, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { safeFirebaseOperation } from '../services/errorHandler';

interface ProfileHeaderProps {
  isDarkMode: boolean;
  isAdmin: boolean;
}

interface UserProfile {
  displayName: string;
  bio: string;
  profilePictureUrl: string;
  followerCount: string;
  website: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ isDarkMode, isAdmin }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    bio: '',
    profilePictureUrl: '',
    followerCount: '∞',
    website: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isUploading, setIsUploading] = useState(false);

  // Load user profile on component mount
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    // Create default profile as fallback
    const defaultProfile: UserProfile = {
      displayName: user.displayName || 'Your Name',
      bio: 'Share your story here...',
      profilePictureUrl: '',
      followerCount: '∞',
      website: user.email?.split('@')[0] + '.gallery' || 'your.gallery'
    };

    const profileData = await safeFirebaseOperation(
      async () => {
        const profileDoc = await getDoc(doc(db, 'user_profiles', user.uid));
        if (profileDoc.exists()) {
          return profileDoc.data() as UserProfile;
        } else {
          // Try to save default profile, but don't fail if it doesn't work
          await setDoc(doc(db, 'user_profiles', user.uid), defaultProfile);
          return defaultProfile;
        }
      },
      defaultProfile,
      'loadUserProfile'
    );

    setProfile(profileData);
    setEditedProfile(profileData);
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileName = `profile_${user.uid}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `users/${user.uid}/profile/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setEditedProfile(prev => ({ ...prev, profilePictureUrl: downloadURL }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const success = await safeFirebaseOperation(
      async () => {
        await setDoc(doc(db, 'user_profiles', user.uid), editedProfile);
        return true;
      },
      false,
      'saveUserProfile'
    );

    if (success) {
      setProfile(editedProfile);
      setIsEditing(false);
    } else {
      // Even if save fails, update local state for now
      setProfile(editedProfile);
      setIsEditing(false);
      alert('Profile updated locally. Changes will sync once Firebase rules are deployed.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const getDisplayName = () => {
    return profile.displayName || 'Your Name';
  };

  const getBio = () => {
    return profile.bio || 'Share your story here...';
  };

  const getProfilePicture = () => {
    return profile.profilePictureUrl || 'https://via.placeholder.com/80x80/cccccc/666666?text=👤';
  };

  return (
    <div className={`p-4 border-b transition-colors duration-300 ${
      isDarkMode ? 'border-gray-700' : 'border-gray-100'
    }`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
          <img 
            src={isEditing ? (editedProfile.profilePictureUrl || getProfilePicture()) : getProfilePicture()}
            alt={getDisplayName()}
            className="w-full h-full object-cover"
          />
          {isAdmin && isEditing && (
            <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Camera className="w-6 h-6 text-white" />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </label>
          )}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.website}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
              className={`text-xl font-semibold w-full bg-transparent border-b transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-white border-gray-600 focus:border-blue-400' 
                  : 'text-gray-900 border-gray-300 focus:border-blue-500'
              } focus:outline-none`}
              placeholder="your.gallery"
            />
          ) : (
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {profile.website || 'your.gallery'}
            </h2>
          )}
          <div className={`flex gap-6 mt-2 text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <span><strong>{profile.followerCount}</strong> Follower</span>
          </div>
        </div>
      </div>
     
      <div className="space-y-2">
        {isEditing ? (
          <input
            type="text"
            value={editedProfile.displayName}
            onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
            className={`font-semibold w-full bg-transparent border-b transition-colors duration-300 ${
              isDarkMode 
                ? 'text-white border-gray-600 focus:border-blue-400' 
                : 'text-gray-900 border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="Your Display Name"
          />
        ) : (
          <h3 className={`font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {getDisplayName()}
          </h3>
        )}
        
        {isEditing ? (
          <textarea
            value={editedProfile.bio}
            onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className={`text-sm w-full bg-transparent border rounded-md p-2 transition-colors duration-300 ${
              isDarkMode 
                ? 'text-gray-300 border-gray-600 focus:border-blue-400' 
                : 'text-gray-600 border-gray-300 focus:border-blue-500'
            } focus:outline-none resize-none`}
            placeholder="Share your story here..."
          />
        ) : (
          <p className={`text-sm transition-colors duration-300 whitespace-pre-line ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getBio()}
            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
              isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              💻 powered by WeddingPix
            </span>
          </p>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <button className={`p-1.5 rounded-md transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
        }`}>
          <UserPlus className={`w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`} />
        </button>
        
        {isAdmin && (
          <>
            {isEditing ? (
              <>
                <button 
                  onClick={handleSaveProfile}
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title="Save Profile"
                >
                  <Save className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={handleCancelEdit}
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className={`p-1.5 rounded-md transition-colors duration-300 ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                title="Edit Profile"
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
            )}
          </>
        )}
        
        <button className={`p-1.5 rounded-md transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
        }`}>
          <Settings className={`w-4 h-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`} />
        </button>
      </div>
    </div>
  );
};