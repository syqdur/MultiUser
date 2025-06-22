import React, { useEffect } from 'react';
import { PrivateRoute } from './components/PrivateRoute';
import { GalleryApp } from './components/GalleryApp';
import { useDarkMode } from './hooks/useDarkMode';
import { setupAuthStateListener, checkAuthStatus } from './services/firebaseAuth';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    // Set up Firebase auth listener with better error handling
    const unsubscribe = setupAuthStateListener();
    
    // Check initial auth status
    setTimeout(() => {
      checkAuthStatus();
    }, 1000);

    return unsubscribe;
  }, []);

  return (
    <PrivateRoute isDarkMode={isDarkMode}>
      <GalleryApp isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </PrivateRoute>
  );
}

export default App;