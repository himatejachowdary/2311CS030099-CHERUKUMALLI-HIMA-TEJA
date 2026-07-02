import React from 'react';
import { AppRouter } from './routes/AppRouter';
import { AuthContextProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeContextProvider>
      <AuthContextProvider>
        <AppRouter />
      </AuthContextProvider>
    </ThemeContextProvider>
  );
}
