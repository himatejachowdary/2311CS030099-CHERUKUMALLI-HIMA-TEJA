import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('campus_portal_dark_mode');
    return saved === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('campus_portal_dark_mode', String(next));
      return next;
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#818cf8' : '#4f46e5', // Indigo 400 vs 600
        light: darkMode ? '#a5b4fc' : '#6366f1',
        dark: darkMode ? '#4f46e5' : '#3730a3',
      },
      secondary: {
        main: darkMode ? '#22d3ee' : '#0891b2', // Cyan 400 vs 600
        light: darkMode ? '#67e8f9' : '#06b6d4',
        dark: darkMode ? '#0891b2' : '#0e7490',
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc', // Slate 900 vs Slate 50
        paper: darkMode ? '#1e293b' : '#ffffff',   // Slate 800 vs White
      },
      text: {
        primary: darkMode ? '#f8fafc' : '#0f172a',
        secondary: darkMode ? '#94a3b8' : '#475569',
      },
      divider: darkMode ? '#334155' : '#e2e8f0',
    },
    typography: {
      fontFamily: '"Outfit", "Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.1rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.16)',
            },
          },
          containedPrimary: {
            background: darkMode 
              ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' 
              : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            boxShadow: darkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)' 
              : '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
}
