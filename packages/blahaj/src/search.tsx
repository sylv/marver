import { NavigateFunction } from 'react-router';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchStore {
  query: string;
}

export const useSearchStore = create(
  persist<SearchStore>(
    () => ({
      query: '',
    }),
    {
      name: 'search',
    }
  )
);

export const setSearch = (query: string, navigate: NavigateFunction) => {
  useSearchStore.setState({ query });
  if (window.location.pathname !== '/') {
    navigate('/');
  }
};
