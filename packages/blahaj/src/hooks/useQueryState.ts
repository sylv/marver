import { useSyncExternalStore } from 'react';

export const useQueryState = <T extends string | number>(key: string, initialValue: T) => {
  const getValue = (): T => {
    const url = new URL(window.location.href);
    const query = url.searchParams.get(key);
    if (!query) return initialValue;
    if (typeof initialValue === 'number') {
      const parsed = +query;
      if (isNaN(parsed)) return initialValue;
      return parsed as T;
    }

    return query as T;
  };

  const value = useSyncExternalStore(
    (onStoreChange) => {
      const listener = () => {
        onStoreChange();
      };

      window.addEventListener('pushstate', listener);
      window.addEventListener('popstate', listener);
      return () => {
        window.removeEventListener('popstate', listener);
        window.removeEventListener('pushstate', listener);
      };
    },
    () => getValue()
  );

  const setValue = (updated: T) => {
    const route = new URL(location.href);
    if (updated === initialValue || updated === '') {
      route.searchParams.delete(key);
    } else {
      const encoded = updated.toString();
      route.searchParams.set(key, encoded);
    }

    history.pushState(null, '', route.toString());
    const event = new PopStateEvent('popstate');
    window.dispatchEvent(event);
  };

  return [value, setValue] as const;
};
