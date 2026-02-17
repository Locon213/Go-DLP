import { createTheme, ThemeOptions } from '@mui/material/styles';

// Theme style types
export type ThemeStyle = 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'midnight' | 'rose' | 'monochrome';

export interface ThemeConfig {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
}

// Material Design 3 inspired color palettes
export const themeConfigs: Record<ThemeStyle, ThemeConfig> = {
  default: {
    primary: '#1976d2',
    primaryLight: '#63a4ff',
    primaryDark: '#004ba0',
    secondary: '#7c4dff',
    secondaryLight: '#b688ff',
    secondaryDark: '#302b70',
    accent: '#00bcd4',
  },
  ocean: {
    primary: '#0288d1',
    primaryLight: '#5eb8ff',
    primaryDark: '#005b9f',
    secondary: '#00796b',
    secondaryLight: '#48a999',
    secondaryDark: '#004d40',
    accent: '#26c6da',
  },
  forest: {
    primary: '#2e7d32',
    primaryLight: '#60ad5e',
    primaryDark: '#005005',
    secondary: '#558b2f',
    secondaryLight: '#85bb5c',
    secondaryDark: '#33691e',
    accent: '#8bc34a',
  },
  sunset: {
    primary: '#e65100',
    primaryLight: '#ff833a',
    primaryDark: '#ac1900',
    secondary: '#f57c00',
    secondaryLight: '#ffad42',
    secondaryDark: '#bc4b00',
    accent: '#ff9800',
  },
  lavender: {
    primary: '#7b1fa2',
    primaryLight: '#ae52d4',
    primaryDark: '#4a0072',
    secondary: '#9c27b0',
    secondaryLight: '#d05ce6',
    secondaryDark: '#6a0080',
    accent: '#e040fb',
  },
  midnight: {
    primary: '#283593',
    primaryLight: '#5f5fc4',
    primaryDark: '#00106c',
    secondary: '#303f9f',
    secondaryLight: '#666ad1',
    secondaryDark: '#001970',
    accent: '#536dfe',
  },
  rose: {
    primary: '#c2185b',
    primaryLight: '#fa5788',
    primaryDark: '#8c0032',
    secondary: '#d81b60',
    secondaryLight: '#ff5c8d',
    secondaryDark: '#a00037',
    accent: '#ff4081',
  },
  monochrome: {
    primary: '#424242',
    primaryLight: '#6d6d6d',
    primaryDark: '#1b1b1b',
    secondary: '#616161',
    secondaryLight: '#8e8e8e',
    secondaryDark: '#373737',
    accent: '#9e9e9e',
  },
};

// Common typography settings for Material Design 3
const typography = {
  fontFamily: [
    '"Roboto"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '-0.015em',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 400,
    letterSpacing: '-0.005em',
    lineHeight: 1.35,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    letterSpacing: '0.0025em',
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    letterSpacing: '0.005em',
    lineHeight: 1.45,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    letterSpacing: '0.0075em',
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.0094em',
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.0071em',
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    letterSpacing: '0.0094em',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.0107em',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none',
    fontWeight: 500,
    letterSpacing: '0.0286em',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.0333em',
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.625rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    lineHeight: 2.66,
  },
};

// Common component overrides for Material Design 3
const getComponentOverrides = (config: ThemeConfig, isDark: boolean): ThemeOptions['components'] => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        textTransform: 'none',
        fontWeight: 500,
        padding: '10px 24px',
        boxShadow: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: isDark 
            ? `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)`
            : `0 1px 2px rgba(0,0,0,0.1), 0 1px 3px 1px rgba(0,0,0,0.05)`,
        },
        '&:active': {
          boxShadow: 'none',
        },
      },
      contained: {
        background: `linear-gradient(135deg, ${config.primary} 0%, ${config.primaryDark} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${config.primaryLight} 0%, ${config.primary} 100%)`,
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5,
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.03)',
        },
      },
      text: {
        '&:hover': {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: isDark 
          ? '0 1px 2px rgba(0,0,0,0.4), 0 2px 6px 2px rgba(0,0,0,0.2)'
          : '0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: isDark 
            ? '0 2px 4px rgba(0,0,0,0.4), 0 4px 12px 3px rgba(0,0,0,0.25)'
            : '0 2px 4px rgba(0,0,0,0.08), 0 4px 12px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: 16,
      },
      rounded: {
        borderRadius: 16,
      },
      elevation1: {
        boxShadow: isDark 
          ? '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)'
          : '0 1px 2px rgba(0,0,0,0.05), 0 1px 3px 1px rgba(0,0,0,0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: isDark 
              ? '0 1px 2px rgba(0,0,0,0.2)'
              : '0 1px 2px rgba(0,0,0,0.08)',
          },
          '&.Mui-focused': {
            boxShadow: isDark 
              ? `0 0 0 2px ${config.primary}40`
              : `0 0 0 2px ${config.primary}20`,
          },
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      notchedOutline: {
        transition: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: isDark 
          ? 'rgba(30, 30, 30, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: 'none',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: 72,
        '@media (min-width: 600px)': {
          minHeight: 80,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        height: 8,
        overflow: 'hidden',
      },
      bar: {
        borderRadius: 8,
        background: `linear-gradient(90deg, ${config.primary} 0%, ${config.accent} 100%)`,
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        color: config.primary,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 28,
        boxShadow: isDark 
          ? '0 8px 16px rgba(0,0,0,0.4), 0 16px 48px 16px rgba(0,0,0,0.3)'
          : '0 8px 16px rgba(0,0,0,0.1), 0 16px 48px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.5rem',
        fontWeight: 500,
        padding: '24px 24px 16px',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '0 24px 24px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px 24px',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 52,
        height: 32,
        padding: 0,
      },
      switchBase: {
        padding: 4,
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          '& + .MuiSwitch-track': {
            backgroundColor: config.primary,
            opacity: 1,
          },
        },
      },
      thumb: {
        width: 24,
        height: 24,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
      track: {
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
        opacity: 1,
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        '&.Mui-checked': {
          color: config.primary,
        },
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        '&.Mui-checked': {
          color: config.primary,
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 8,
        fontSize: '0.75rem',
        padding: '8px 12px',
      },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiAlert-root': {
          borderRadius: 12,
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: '12px 16px',
      },
      standardSuccess: {
        backgroundColor: isDark ? '#1b4332' : '#d8f3dc',
        color: isDark ? '#b7e4c7' : '#1b4332',
      },
      standardError: {
        backgroundColor: isDark ? '#4a1c1c' : '#fde7e7',
        color: isDark ? '#f5c2c2' : '#5c1a1a',
      },
      standardWarning: {
        backgroundColor: isDark ? '#4a3c1c' : '#fff3cd',
        color: isDark ? '#f5e6a5' : '#856404',
      },
      standardInfo: {
        backgroundColor: isDark ? '#1c3a4a' : '#e3f2fd',
        color: isDark ? '#a5d8f5' : '#0c5460',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9375rem',
        minHeight: 48,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '2px 8px',
        '&.Mui-selected': {
          backgroundColor: isDark 
            ? `${config.primary}20`
            : `${config.primary}10`,
          '&:hover': {
            backgroundColor: isDark 
              ? `${config.primary}30`
              : `${config.primary}18`,
          },
        },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: isDark 
          ? '0 4px 8px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.3)'
          : '0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: config.primary,
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
      },
    },
  },
});

// Create light theme for a given style
export const createLightTheme = (style: ThemeStyle) => {
  const config = themeConfigs[style];
  
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: config.primary,
        light: config.primaryLight,
        dark: config.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: config.secondary,
        light: config.secondaryLight,
        dark: config.secondaryDark,
        contrastText: '#ffffff',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#1c1b1f',
        secondary: '#49454f',
        disabled: '#1c1b1f61',
      },
      error: {
        main: '#b3261e',
        light: '#e53935',
        dark: '#8e0000',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f57c00',
        light: '#ffb74d',
        dark: '#e65100',
        contrastText: '#000000',
      },
      info: {
        main: config.primary,
        light: config.primaryLight,
        dark: config.primaryDark,
        contrastText: '#ffffff',
      },
      success: {
        main: '#2e7d32',
        light: '#60ad5e',
        dark: '#005005',
        contrastText: '#ffffff',
      },
      grey: {
        50: '#fdf8ff',
        100: '#f3edf7',
        200: '#e8def8',
        300: '#d0bcff',
        400: '#b69df8',
        500: '#9a82db',
        600: '#79747e',
        700: '#49454f',
        800: '#322c3b',
        900: '#1d192b',
      },
      divider: '#cac4d0',
    },
    typography,
    components: getComponentOverrides(config, false),
    shape: {
      borderRadius: 16,
    },
  });
};

// Create dark theme for a given style
export const createDarkTheme = (style: ThemeStyle) => {
  const config = themeConfigs[style];
  
  return createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: config.primaryLight,
        light: config.primary,
        dark: config.accent,
        contrastText: '#000000',
      },
      secondary: {
        main: config.secondaryLight,
        light: config.secondary,
        dark: config.secondaryDark,
        contrastText: '#000000',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#e6e1e5',
        secondary: '#c9c5ca',
        disabled: '#e6e1e561',
      },
      error: {
        main: '#f2b8b5',
        light: '#ff9d9d',
        dark: '#93000a',
        contrastText: '#000000',
      },
      warning: {
        main: '#ffcf44',
        light: '#ffe082',
        dark: '#c27c00',
        contrastText: '#000000',
      },
      info: {
        main: config.primaryLight,
        light: config.primary,
        dark: config.primaryDark,
        contrastText: '#000000',
      },
      success: {
        main: '#81c784',
        light: '#a5d6a7',
        dark: '#388e3c',
        contrastText: '#000000',
      },
      grey: {
        50: '#1d1b20',
        100: '#2b2930',
        200: '#36343b',
        300: '#484649',
        400: '#605d62',
        500: '#78757a',
        600: '#938f94',
        700: '#b0b0b0',
        800: '#d9d9d9',
        900: '#fdf8ff',
      },
      divider: '#49454f',
    },
    typography,
    components: getComponentOverrides(config, true),
    shape: {
      borderRadius: 16,
    },
  });
};

// Get theme by style and mode
export const getTheme = (style: ThemeStyle, darkMode: boolean) => {
  return darkMode ? createDarkTheme(style) : createLightTheme(style);
};

// Export default themes for backward compatibility
export const darkTheme = createDarkTheme('default');
export const lightTheme = createLightTheme('default');