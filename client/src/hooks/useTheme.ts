import { useState, useEffect } from 'react';

export type ThemeType = 'wedding' | 'vacation' | 'birthday';

interface ThemeConfig {
  id: ThemeType;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
  texts: {
    welcome: string;
    uploadPrompt: string;
    notesPlaceholder: string;
    storiesPrompt: string;
  };
}

const themes: Record<ThemeType, ThemeConfig> = {
  wedding: {
    id: 'wedding',
    name: 'Wedding',
    colors: {
      primary: '#e91e63', // deep pink
      secondary: '#f06292', // pink-300
      accent: '#fce4ec', // pink-50
      background: 'linear-gradient(135deg, #ffeef7 0%, #fff0f8 100%)',
      surface: '#ffffff'
    },
    gradients: {
      primary: 'from-rose-400 via-pink-500 to-purple-500',
      secondary: 'from-pink-50 via-rose-50 to-purple-50'
    },
    texts: {
      welcome: 'Willkommen zu unserer Hochzeitsgalerie! 💕✨',
      uploadPrompt: 'Teilt eure magischsten Hochzeitsmomente mit uns',
      notesPlaceholder: 'Hinterlasst uns eine liebevolle Nachricht voller Herzlichkeit...',
      storiesPrompt: 'Zeigt uns die romantischsten Augenblicke des Tages!'
    }
  },
  vacation: {
    id: 'vacation',
    name: 'Vacation',
    colors: {
      primary: '#00bcd4', // cyan-500
      secondary: '#4dd0e1', // cyan-300
      accent: '#e0f7fa', // cyan-50
      background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)',
      surface: '#ffffff'
    },
    gradients: {
      primary: 'from-cyan-400 via-teal-500 to-blue-500',
      secondary: 'from-cyan-50 via-teal-50 to-blue-50'
    },
    texts: {
      welcome: 'Willkommen zu unserer Urlaubsgalerie! 🌊🏝️',
      uploadPrompt: 'Teilt eure unvergesslichsten Urlaubsabenteuer',
      notesPlaceholder: 'Erzählt uns von euren traumhaften Urlaubserlebnissen...',
      storiesPrompt: 'Zeigt uns die paradiesischsten Momente eurer Reise!'
    }
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    colors: {
      primary: '#ff6f00', // orange-600
      secondary: '#ffb74d', // orange-300
      accent: '#fff3e0', // orange-50
      background: 'linear-gradient(135deg, #fff8e1 0%, #ffeaa7 100%)',
      surface: '#ffffff'
    },
    gradients: {
      primary: 'from-yellow-400 via-orange-500 to-red-500',
      secondary: 'from-yellow-50 via-orange-50 to-red-50'
    },
    texts: {
      welcome: 'Willkommen zu unserer Geburtstagsfeier! 🎂🎉',
      uploadPrompt: 'Teilt die spektakulärsten Partymomente',
      notesPlaceholder: 'Schreibt eure herzlichsten Geburtstagswünsche hier...',
      storiesPrompt: 'Zeigt uns die ausgelassensten Partymomente!'
    }
  }
};

export const useTheme = (initialTheme: ThemeType = 'wedding') => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('gallery_theme');
    return (saved as ThemeType) || initialTheme;
  });

  useEffect(() => {
    // Apply CSS custom properties for the theme
    const theme = themes[currentTheme];
    if (theme) {
      const root = document.documentElement;
      
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
      root.style.setProperty('--theme-background', theme.colors.background);
      root.style.setProperty('--theme-surface', theme.colors.surface);
    }
  }, [currentTheme]);

  const changeTheme = (newTheme: ThemeType) => {
    setCurrentTheme(newTheme);
    // Save to localStorage for persistence
    localStorage.setItem('gallery_theme', newTheme);
  };

  const getThemeConfig = () => themes[currentTheme] || themes.wedding;

  const getThemeClasses = () => {
    const theme = themes[currentTheme];
    if (!theme) {
      return {
        primaryGradient: 'bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500',
        secondaryGradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50',
        primaryButton: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg transform hover:scale-105 transition-all',
        accentButton: 'bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 text-pink-800 shadow-sm',
        accentBg: 'bg-gradient-to-br from-pink-50 to-rose-50'
      };
    }
    
    return {
      primaryGradient: `bg-gradient-to-r ${theme.gradients.primary}`,
      secondaryGradient: `bg-gradient-to-br ${theme.gradients.secondary}`,
      primaryButton: currentTheme === 'wedding' 
        ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg transform hover:scale-105 transition-all'
        : currentTheme === 'vacation'
        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg transform hover:scale-105 transition-all'
        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transform hover:scale-105 transition-all',
      accentButton: currentTheme === 'wedding'
        ? 'bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-pink-800 shadow-sm'
        : currentTheme === 'vacation'
        ? 'bg-gradient-to-r from-cyan-100 to-teal-100 hover:from-cyan-200 hover:to-teal-200 text-cyan-800 shadow-sm'
        : 'bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 text-orange-800 shadow-sm',
      accentBg: currentTheme === 'wedding'
        ? 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50'
        : currentTheme === 'vacation'
        ? 'bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50'
        : 'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50'
    };
  };

  return {
    currentTheme,
    changeTheme,
    getThemeConfig,
    getThemeClasses,
    themes
  };
};