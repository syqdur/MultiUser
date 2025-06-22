import React from 'react';
import { PrivateRoute } from './components/PrivateRoute';
import { GalleryApp } from './components/GalleryApp';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <PrivateRoute isDarkMode={isDarkMode}>
      <GalleryApp isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </PrivateRoute>
  );
}

export default App;