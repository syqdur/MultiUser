import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Lock,
  Camera,
  Heart,
  Share2,
  Sparkles
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LandingPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onUserLogin: (user: any) => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  isDarkMode,
  toggleDarkMode,
  onUserLogin,
  onAdminLogin
}) => {
  const [mode, setMode] = useState<'home' | 'user-login' | 'user-register' | 'admin-login'>('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Master admin credentials
  const masterAdminCredentials = {
    username: "master",
    password: "weddingpix2025"
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onUserLogin(userCredential.user);
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // You can add user profile creation here
      onUserLogin(userCredential.user);
    } catch (error: any) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === masterAdminCredentials.username && password === masterAdminCredentials.password) {
      onAdminLogin();
    } else {
      setError('Invalid master admin credentials');
    }
  };

  if (mode === 'home') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
      }`}>
        {/* Header */}
        <header className="relative z-10 p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-sm`}>
                <Camera className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-pink-600'}`} />
              </div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                WeddingPix
              </h1>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white/80 hover:bg-white text-gray-700'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className={`text-5xl md:text-7xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Capture Every
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  {' '}Moment
                </span>
              </h2>
              <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create beautiful wedding galleries, share stories, and preserve memories forever. 
                Join thousands of couples sharing their special moments.
              </p>
              
              {/* Feature Icons */}
              <div className="flex justify-center gap-8 mb-12">
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-2 ${
                    isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'
                  }`}>
                    <Heart className={`w-6 h-6 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Beautiful Galleries
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-2 ${
                    isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Share2 className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Easy Sharing
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`p-4 rounded-full mb-2 ${
                    isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <Sparkles className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Magic Moments
                  </span>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* User Registration */}
              <div className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white/80 border-white/50 hover:bg-white/90'
              }`}>
                <div className={`p-4 rounded-full mb-6 w-fit mx-auto ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <User className={`w-8 h-8 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Create Account
                </h3>
                <p className={`text-center mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Start your journey and create your own wedding gallery
                </p>
                <button
                  onClick={() => setMode('user-register')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Get Started
                </button>
              </div>

              {/* User Login */}
              <div className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white/80 border-white/50 hover:bg-white/90'
              }`}>
                <div className={`p-4 rounded-full mb-6 w-fit mx-auto ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Users className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome Back
                </h3>
                <p className={`text-center mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Access your existing gallery and continue sharing
                </p>
                <button
                  onClick={() => setMode('user-login')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>

              {/* Master Admin */}
              <div className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white/80 border-white/50 hover:bg-white/90'
              }`}>
                <div className={`p-4 rounded-full mb-6 w-fit mx-auto ${
                  isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <Shield className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Master Admin
                </h3>
                <p className={`text-center mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Full system access and user management dashboard
                </p>
                <button
                  onClick={() => setMode('admin-login')}
                  className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                >
                  Admin Access
                </button>
              </div>
            </div>

            {/* Footer */}
            <footer className={`text-center mt-16 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>© 2025 WeddingPix. Made with ❤️ for unforgettable moments.</p>
            </footer>
          </div>
        </main>
      </div>
    );
  }

  // Login/Register Forms
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl backdrop-blur-sm border ${
        isDarkMode 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/90 border-white/50'
      }`}>
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => setMode('home')}
            className={`mb-4 px-4 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ← Back to Home
          </button>
          
          <div className={`p-3 rounded-xl mb-4 w-fit mx-auto ${
            isDarkMode ? 'bg-white/10' : 'bg-white/80'
          }`}>
            {mode === 'admin-login' ? (
              <Shield className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            ) : (
              <User className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            )}
          </div>
          
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'user-login' && 'Welcome Back'}
            {mode === 'user-register' && 'Create Account'}
            {mode === 'admin-login' && 'Master Admin'}
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {mode === 'user-login' && 'Sign in to your gallery'}
            {mode === 'user-register' && 'Join the WeddingPix community'}
            {mode === 'admin-login' && 'System administration access'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg border ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-700/30 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={
          mode === 'user-login' ? handleUserLogin :
          mode === 'user-register' ? handleUserRegister :
          handleAdminLogin
        }>
          {mode === 'user-register' && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Display Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {mode === 'admin-login' ? 'Username' : 'Email'}
            </label>
            <div className="relative">
              {mode === 'admin-login' ? (
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              ) : (
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              )}
              <input
                type={mode === 'admin-login' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder={mode === 'admin-login' ? 'master' : 'your@email.com'}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'user-register' && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/20 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              mode === 'admin-login'
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                : mode === 'user-register'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Please wait...' : (
              mode === 'user-login' ? 'Sign In' :
              mode === 'user-register' ? 'Create Account' :
              'Access Dashboard'
            )}
          </button>
        </form>

        {/* Footer Links */}
        {mode !== 'admin-login' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'user-login' ? 'user-register' : 'user-login')}
              className={`text-sm hover:underline ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {mode === 'user-login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};