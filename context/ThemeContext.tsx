import React, { createContext, useContext, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS, DARK_COLORS } from '@/constants/Theme';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  isDark: boolean;
  colors: typeof COLORS;
  setMode: (mode: ThemeMode) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  isDark: false,
  colors: COLORS,
  setMode: () => {},
  toggleDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const resolvedMode = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const isDark = resolvedMode === 'dark';
  const colors = isDark ? DARK_COLORS : COLORS;

  const toggleDark = useCallback(() => {
    setMode(prev => {
      const current = prev === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : prev;
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemScheme]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, isDark, colors, setMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
