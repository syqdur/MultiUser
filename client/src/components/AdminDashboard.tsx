import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Images, 
  Database, 
  Settings, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Download,
  Calendar,
  Mail,
  User,
  Image,
  Video,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  profilePictureUrl?: string;
  bio?: string;
  theme: 'wedding' | 'vacation' | 'birthday';
  website: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'archived';
  galleryCount: number;
}

interface AdminGallery {
  id: string;
  userId: string;
  title: string;
  description?: string;
  theme: 'wedding' | 'vacation' | 'birthday';
  public: boolean;
  createdAt: string;
  updatedAt: string;
  mediaCount: number;
  settings: {
    allowComments: boolean;
    allowLikes: boolean;
    allowStories: boolean;
    passwordProtected: boolean;
  };
}

interface AdminDashboardProps {
  isDarkMode: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isDarkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'galleries' | 'storage' | 'settings'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [galleries, setGalleries] = useState<AdminGallery[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
    loadGalleries();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: AdminUser[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        // Count galleries for this user
        const galleriesSnapshot = await getDocs(
          query(collection(db, 'galleries'), where('userId', '==', userDoc.id))
        );
        
        usersData.push({
          id: userDoc.id,
          email: userData.email || 'No email',
          displayName: userData.displayName || 'Unnamed User',
          profilePictureUrl: userData.profilePictureUrl,
          bio: userData.bio,
          theme: userData.theme || 'wedding',
          website: userData.website || `${userData.displayName || 'user'}.gallery`,
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin,
          status: userData.status || 'active',
          galleryCount: galleriesSnapshot.size
        });
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      // Add demo data for development when Firebase permissions are not set up
      const demoUsers: AdminUser[] = [
        {
          id: '5IxKWZd3LmbELYfaAxzpyff3W1F3',
          email: 'dev1@example.com',
          displayName: 'Penis',
          profilePictureUrl: undefined,
          bio: 'Demo user account',
          theme: 'wedding',
          website: 'penis.gallery',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active',
          galleryCount: 4
        },
        {
          id: 'demo-user-2',
          email: 'couple@wedding.com',
          displayName: 'Wedding Couple',
          profilePictureUrl: undefined,
          bio: 'Beautiful wedding gallery',
          theme: 'wedding',
          website: 'couple.gallery',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          status: 'active',
          galleryCount: 2
        },
        {
          id: 'demo-user-3',
          email: 'vacation@travel.com',
          displayName: 'Travel Memories',
          profilePictureUrl: undefined,
          bio: 'Amazing vacation photos',
          theme: 'vacation',
          website: 'travel.gallery',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          status: 'active',
          galleryCount: 1
        }
      ];
      setUsers(demoUsers);
    }
  };

  const loadGalleries = async () => {
    try {
      const galleriesSnapshot = await getDocs(collection(db, 'galleries'));
      const galleriesData: AdminGallery[] = [];
      
      for (const galleryDoc of galleriesSnapshot.docs) {
        const galleryData = galleryDoc.data();
        // Count media items for this gallery
        const mediaSnapshot = await getDocs(
          query(collection(db, 'user_media'), where('galleryId', '==', galleryDoc.id))
        );
        
        galleriesData.push({
          id: galleryDoc.id,
          userId: galleryData.userId,
          title: galleryData.title || 'Untitled Gallery',
          description: galleryData.description,
          theme: galleryData.theme || 'wedding',
          public: galleryData.public || false,
          createdAt: galleryData.createdAt || new Date().toISOString(),
          updatedAt: galleryData.updatedAt || new Date().toISOString(),
          mediaCount: mediaSnapshot.size,
          settings: galleryData.settings || {
            allowComments: true,
            allowLikes: true,
            allowStories: true,
            passwordProtected: false
          }
        });
      }
      
      setGalleries(galleriesData);
    } catch (error) {
      console.error('Error loading galleries:', error);
      // Add demo data for development
      const demoGalleries: AdminGallery[] = [
        {
          id: 'gallery-1',
          userId: '5IxKWZd3LmbELYfaAxzpyff3W1F3',
          title: 'Main Wedding Gallery',
          description: 'Our beautiful wedding memories',
          theme: 'wedding',
          public: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mediaCount: 4,
          settings: {
            allowComments: true,
            allowLikes: true,
            allowStories: true,
            passwordProtected: false
          }
        },
        {
          id: 'gallery-2',
          userId: 'demo-user-2',
          title: 'Honeymoon Adventure',
          description: 'Romantic getaway photos',
          theme: 'vacation',
          public: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          mediaCount: 2,
          settings: {
            allowComments: true,
            allowLikes: true,
            allowStories: false,
            passwordProtected: true
          }
        },
        {
          id: 'gallery-3',
          userId: 'demo-user-3',
          title: 'Birthday Celebration',
          description: 'Annual birthday party',
          theme: 'birthday',
          public: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          mediaCount: 1,
          settings: {
            allowComments: true,
            allowLikes: true,
            allowStories: true,
            passwordProtected: false
          }
        }
      ];
      setGalleries(demoGalleries);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      await loadUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const updateGalleryTheme = async (galleryId: string, theme: string) => {
    try {
      await updateDoc(doc(db, 'galleries', galleryId), { theme, updatedAt: new Date().toISOString() });
      await loadGalleries(); // Refresh data
    } catch (error) {
      console.error('Error updating gallery theme:', error);
    }
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'wedding': return 'text-pink-500 bg-pink-100 dark:bg-pink-900/30';
      case 'vacation': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'birthday': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = filterTheme === 'all' || user.theme === filterTheme;
    return matchesSearch && matchesTheme;
  });

  const filteredGalleries = galleries.filter(gallery => {
    const user = users.find(u => u.id === gallery.userId);
    const matchesSearch = gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gallery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTheme = filterTheme === 'all' || gallery.theme === filterTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-7xl h-full max-h-[90vh] rounded-2xl overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                WeddingPix Master Admin Dashboard
              </h2>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Comprehensive management for all users and galleries • {users.length} users • {galleries.length} galleries
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Back to Landing
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search users, galleries, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Themes</option>
              <option value="wedding">Wedding</option>
              <option value="vacation">Vacation</option>
              <option value="birthday">Birthday</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'galleries', label: 'Galleries', icon: Images },
              { id: 'storage', label: 'Storage', icon: Database },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      All Users ({filteredUsers.length})
                    </h3>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className={`text-center py-12 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No users found matching your search criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={`rounded-lg border transition-colors duration-300 ${
                          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => toggleUserExpansion(user.id)}
                                className={`p-1 rounded transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                              >
                                {expandedUsers.has(user.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>

                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                {user.profilePictureUrl ? (
                                  <img 
                                    src={user.profilePictureUrl} 
                                    alt={user.displayName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className={`font-semibold transition-colors duration-300 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {user.displayName}
                                </h4>
                                <p className={`text-sm transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {user.email}
                                </p>
                              </div>

                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(user.theme)}`}>
                                {user.theme}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {user.galleryCount} galleries
                              </span>

                              <button
                                onClick={() => window.open(`/gallery/${user.id}`, '_blank')}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title="Open Gallery"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => setSelectedUser(user)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedUsers.has(user.id) && (
                            <div className={`mt-4 pt-4 border-t transition-colors duration-300 ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    User ID
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {user.id}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Website
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {user.website}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Created
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Status
                                  </p>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    {user.status}
                                  </span>
                                </div>
                              </div>

                              {user.bio && (
                                <div className="mt-3">
                                  <p className={`text-xs font-medium transition-colors duration-300 ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Bio
                                  </p>
                                  <p className={`text-sm transition-colors duration-300 ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {user.bio}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              {/* Galleries Tab */}
              {activeTab === 'galleries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      All Galleries ({filteredGalleries.length})
                    </h3>
                  </div>

                  {filteredGalleries.length === 0 ? (
                    <div className={`text-center py-12 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No galleries found matching your search criteria.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredGalleries.map(gallery => {
                      const user = users.find(u => u.id === gallery.userId);
                      return (
                        <div
                          key={gallery.id}
                          className={`p-4 rounded-lg border transition-colors duration-300 ${
                            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className={`font-semibold transition-colors duration-300 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {gallery.title}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(gallery.theme)}`}>
                                  {gallery.theme}
                                </span>
                                {gallery.public && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    Public
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Owner: {user?.displayName || 'Unknown'} • {gallery.mediaCount} items
                              </p>
                              {gallery.description && (
                                <p className={`text-sm mt-1 transition-colors duration-300 ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {gallery.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={gallery.theme}
                                onChange={(e) => updateGalleryTheme(gallery.id, e.target.value)}
                                className={`px-3 py-1 rounded border text-sm transition-colors ${
                                  isDarkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="wedding">Wedding</option>
                                <option value="vacation">Vacation</option>
                                <option value="birthday">Birthday</option>
                              </select>

                              <button
                                onClick={() => window.open(`/gallery/${gallery.userId}`, '_blank')}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                                title="Open Gallery"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <p className={`text-xs font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Gallery ID
                              </p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {gallery.id}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Created
                              </p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {new Date(gallery.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Comments
                              </p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {gallery.settings.allowComments ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-medium transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Stories
                              </p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {gallery.settings.allowStories ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              )}

              {/* Storage Tab */}
              {activeTab === 'storage' && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Storage Management
                  </h3>
                  <div className={`p-8 text-center border-2 border-dashed rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                  }`}>
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <p>Storage management features coming soon...</p>
                    <p className="text-sm mt-2">Will include file browser, bulk operations, and storage analytics.</p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    System Settings
                  </h3>
                  <div className={`p-8 text-center border-2 border-dashed rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                  }`}>
                    <Settings className="w-12 h-12 mx-auto mb-4" />
                    <p>System settings coming soon...</p>
                    <p className="text-sm mt-2">Will include global configurations, permissions, and system health monitoring.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className={`max-w-md w-full rounded-lg p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Edit User: {selectedUser.displayName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={selectedUser.displayName}
                  onChange={(e) => setSelectedUser({...selectedUser, displayName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Theme
                </label>
                <select
                  value={selectedUser.theme}
                  onChange={(e) => setSelectedUser({...selectedUser, theme: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="wedding">Wedding</option>
                  <option value="vacation">Vacation</option>
                  <option value="birthday">Birthday</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as any})}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  updateUserProfile(selectedUser.id, {
                    displayName: selectedUser.displayName,
                    theme: selectedUser.theme,
                    status: selectedUser.status
                  });
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};