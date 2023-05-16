import { useEffect, useState } from 'react';

export const useDebounced = <T>(value: T, duration: number): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounced(value);
    }, duration);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, duration]);

  return debounced;
};
