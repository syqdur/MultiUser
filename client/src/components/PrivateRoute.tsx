import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface PrivateRouteProps {
  children: React.ReactNode;
  isDarkMode: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isDarkMode }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className="text-center max-w-md mx-auto p-8">
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                WeddingPix
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create and share your beautiful wedding gallery
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
              
              <div className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Multi-user platform with isolated galleries
              </div>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          isDarkMode={isDarkMode}
        />
      </>
    );
  }

  return <>{children}</>;
};