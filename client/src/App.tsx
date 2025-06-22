import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import { PrivateRoute } from './components/PrivateRoute';
import { GalleryApp } from './components/GalleryApp';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicStoryViewer } from './components/PublicStoryViewer';
import { useDarkMode } from './hooks/useDarkMode';
import { setupAuthStateListener, checkAuthStatus } from './services/firebaseAuth';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return localStorage.getItem('admin_mode') === 'true';
  });

  const handleUserLogin = (user: any) => {
    setUser(user);
  };

  const handleAdminLogin = () => {
    setIsAdminMode(true);
    localStorage.setItem('admin_mode', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    localStorage.removeItem('admin_mode');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public story viewing route - no authentication required */}
      <Route path="/story/:storyId">
        {(params) => (
          <PublicStoryViewer 
            storyId={params.storyId} 
            isDarkMode={isDarkMode} 
          />
        )}
      </Route>
      
      {/* Admin dashboard route */}
      <Route path="/admin">
        {() => (
          isAdminMode ? (
            <AdminDashboard
              isDarkMode={isDarkMode}
              onClose={handleAdminLogout}
            />
          ) : (
            <LandingPage
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onUserLogin={handleUserLogin}
              onAdminLogin={handleAdminLogin}
            />
          )
        )}
      </Route>
      
      {/* Default route - landing page or gallery */}
      <Route>
        {() => {
          // Show admin dashboard if in admin mode
          if (isAdminMode) {
            return (
              <AdminDashboard
                isDarkMode={isDarkMode}
                onClose={handleAdminLogout}
              />
            );
          }
          
          // Show landing page if no user
          if (!user) {
            return (
              <LandingPage
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                onUserLogin={handleUserLogin}
                onAdminLogin={handleAdminLogin}
              />
            );
          }
          
          // Show gallery for authenticated users
          return (
            <PrivateRoute isDarkMode={isDarkMode}>
              <GalleryApp isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            </PrivateRoute>
          );
        }}
      </Route>
    </Switch>
  );
}

export default App;