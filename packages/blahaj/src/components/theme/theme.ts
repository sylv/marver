import { create } from 'zustand';
import { disableAnimations } from './disable-animations';

export const STORAGE_KEY = 'ui-theme';
export const DEFAULT_THEME = 'system';

export const themeStore = create<string | null>(() => {
  if (typeof localStorage === 'undefined') {
    // during SSR we can't know the final theme, and defaulting to system
    // should not cause SSR mismatches because it shouldn't change anything visually.
    return DEFAULT_THEME;
  }

  // the head script has already hydrated the theme, so we don't have to do anything.
  // todo: this makes assumptions about the <head> script, maybe we should inspect the document
  // classes instead of assuming it was set matching our logic?
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme) return storedTheme;
  return DEFAULT_THEME;
});

export const setTheme = (theme: string | null) => {
  if (!theme) theme = DEFAULT_THEME;

  if (theme === DEFAULT_THEME) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, theme);
  useTheme.setState(theme);

  const root = window.document.documentElement;
  const systemClass = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const themeClass = theme === 'system' ? systemClass : theme;

  if (!root.classList.contains(themeClass)) {
    disableAnimations();
    const opposite = themeClass === 'dark' ? 'light' : 'dark';
    root.classList.remove(opposite);
    root.classList.add(themeClass);
  }
};

export const useTheme = themeStore;
