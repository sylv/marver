import { navigate } from 'vike/client/router';
import {} from 'vike/routing';
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
    },
  ),
);

export const setSearch = (query: string) => {
  useSearchStore.setState({ query });
  if (window.location.pathname !== '/') {
    void navigate('/');
  }
};
