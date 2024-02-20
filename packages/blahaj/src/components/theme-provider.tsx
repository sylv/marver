import { createContext, useContext, useEffect, useState } from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: string | null;
  setTheme: (theme: string) => void;
};

const initialState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const storageKey = 'ui-theme';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setThemeInner] = useState<string | null>(null);

  const setTheme = (theme: string) => {
    const css = document.createElement('style');
    css.type = 'text/css';
    css.append(
      document.createTextNode(
        `* {
          transition: none !important;
        }`,
      ),
    );
    document.head.append(css);
    setThemeInner(theme);
    setTimeout(() => {
      css.remove();
    }, 200);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    if (theme && !root.classList.contains(theme)) {
      const opposite = theme === 'dark' ? 'light' : 'dark';
      root.classList.remove(opposite);
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: string) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
