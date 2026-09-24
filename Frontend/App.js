import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import ResponsiveShell from './src/components/ResponsiveShell';
import { AuthProvider } from './src/context/AuthContext';

// One-time global CSS polish for the web target: smoother font rendering,
// a slim on-brand scrollbar, and no jarring blue tap-highlight on touch —
// small details that separate a "wrapped mobile app" from a native web feel.
function useWebPolish() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; }
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #2A1620;
        overscroll-behavior: none;
      }
      * { -webkit-tap-highlight-color: transparent; }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(192,64,90,0.35); border-radius: 8px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(192,64,90,0.55); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}

export default function App() {
  useWebPolish();
  return (
    <ResponsiveShell>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ResponsiveShell>
  );
}
