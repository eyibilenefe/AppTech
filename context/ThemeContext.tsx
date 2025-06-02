import { AppTheme, getTheme } from '@/constants/Theme'; // Assuming Theme.ts is in constants
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ThemeContextType = {
  theme: AppTheme;
  themeName: 'light' | 'dark' | 'black';
  setThemeName: (name: 'light' | 'dark' | 'black') => void;
  isLoadingTheme: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@MyApp:themeName';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeNameState] = useState<'light' | 'dark' | 'black'>('light');
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | 'black' | null;
        if (storedThemeName) {
          setThemeNameState(storedThemeName);
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
        // Fallback to default theme (light)
      } finally {
        setIsLoadingTheme(false);
      }
    };
    loadTheme();
  }, []);

  const setThemeName = async (name: 'light' | 'dark' | 'black') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      setThemeNameState(name);
    } catch (error) {
      console.error("Failed to save theme to storage", error);
    }
  };

  const theme = getTheme(themeName);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, isLoadingTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 