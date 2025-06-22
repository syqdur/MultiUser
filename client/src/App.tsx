import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { PrivateRoute } from './components/PrivateRoute';
import { GalleryApp } from './components/GalleryApp';
import { PublicStoryViewer } from './components/PublicStoryViewer';
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
      
      {/* Private routes - authentication required */}
      <Route>
        <PrivateRoute isDarkMode={isDarkMode}>
          <GalleryApp isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </PrivateRoute>
      </Route>
    </Switch>
  );
}

export default App;