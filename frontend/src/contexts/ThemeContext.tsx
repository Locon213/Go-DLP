import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getTheme, ThemeStyle, themeConfigs } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
  themeStyles: typeof themeConfigs;
  getThemeName: (style: ThemeStyle) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Storage keys
const DARK_MODE_KEY = 'godlp-dark-mode';
const THEME_STYLE_KEY = 'godlp-theme-style';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { t } = useLanguage();

  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    const savedTheme = localStorage.getItem(DARK_MODE_KEY);
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize theme style from localStorage or default
  const [themeStyle, setThemeStyle] = React.useState<ThemeStyle>(() => {
    const savedStyle = localStorage.getItem(THEME_STYLE_KEY);
    if (savedStyle && savedStyle in themeConfigs) {
      return savedStyle as ThemeStyle;
    }
    return 'default';
  });

  // Function to get localized theme name
  const getThemeName = (style: ThemeStyle): string => {
    const themeNameKey: Record<ThemeStyle, keyof typeof t> = {
      default: 'themeDefault',
      ocean: 'themeOcean',
      forest: 'themeForest',
      sunset: 'themeSunset',
      lavender: 'themeLavender',
      midnight: 'themeMidnight',
      rose: 'themeRose',
      monochrome: 'themeMonochrome',
    };
    return t[themeNameKey[style]] || style;
  };

  // Save dark mode preference and update body class
  useEffect(() => {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode));
    
    // Update body class for CSS styling
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(darkMode ? 'dark-theme' : 'light-theme');
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', darkMode ? '#121212' : '#fafafa');
    }
  }, [darkMode]);

  // Save theme style preference
  useEffect(() => {
    localStorage.setItem(THEME_STYLE_KEY, themeStyle);
    
    // Update CSS custom properties for the current theme
    const config = themeConfigs[themeStyle];
    document.documentElement.style.setProperty('--theme-primary', config.primary);
    document.documentElement.style.setProperty('--theme-primary-light', config.primaryLight);
    document.documentElement.style.setProperty('--theme-primary-dark', config.primaryDark);
    document.documentElement.style.setProperty('--theme-secondary', config.secondary);
    document.documentElement.style.setProperty('--theme-accent', config.accent);
  }, [themeStyle]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      const savedTheme = localStorage.getItem(DARK_MODE_KEY);
      if (savedTheme === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  // Create theme memoized for performance
  const theme = useMemo(() => {
    return getTheme(themeStyle, darkMode);
  }, [themeStyle, darkMode]);

  const value = useMemo(() => ({
    darkMode,
    toggleTheme,
    themeStyle,
    setThemeStyle,
    themeStyles: themeConfigs,
    getThemeName,
  }), [darkMode, themeStyle, t]);

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};