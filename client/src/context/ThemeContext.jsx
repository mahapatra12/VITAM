import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { safeLocalStorage } from '../utils/browserStorage';

const ThemeContext = createContext();
const THEME_KEY = 'vitam-theme';
const LEGACY_THEME_KEY = 'vitam_theme';

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readStoredThemePreference = () => {
  const stored = safeLocalStorage.getItem(THEME_KEY) || safeLocalStorage.getItem(LEGACY_THEME_KEY);
  return ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = useMemo(
    () => (theme === 'system' ? systemTheme : theme),
    [systemTheme, theme]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeLocalStorage.setItem(THEME_KEY, theme);
    safeLocalStorage.setItem(LEGACY_THEME_KEY, theme);
  }, [resolvedTheme, theme]);

  const toggleTheme = () => {
    setTheme((current) => {
      const baseTheme = current === 'system' ? systemTheme : current;
      return baseTheme === 'light' ? 'dark' : 'light';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
