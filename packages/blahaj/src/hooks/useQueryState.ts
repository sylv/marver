import { useSyncExternalStore } from 'react';
import { usePageContext } from '../renderer/usePageContext';

export const useQueryState = <T extends string | number>(key: string, initialValue: T) => {
  const context = usePageContext();
  const getValueServer = (): T => {
    console.log(context.urlParsed);
    const raw = context.urlParsed.search[key];
    return parseValue(raw);
  };

  const getValue = (): T => {
    if (typeof window === 'undefined') {
      return getValueServer();
    }

    const url = new URL(window.location.href);
    const raw = url.searchParams.get(key);
    return parseValue(raw);
  };

  const parseValue = (raw?: string | null) => {
    if (!raw) return initialValue;
    if (typeof initialValue === 'number') {
      const parsed = +raw;
      if (Number.isNaN(parsed)) return initialValue;
      return parsed as T;
    }

    return raw as T;
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
    () => getValue(),
    () => getValueServer(),
  );

  console.log({ value });

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
