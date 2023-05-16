import { useEffect } from 'react';

export interface UseInfiniteScrollOptions {
  ref: React.RefObject<HTMLElement>;
  hasNextPage: boolean;
  loadMore: () => void;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions) => {
  useEffect(() => {
    if (!options.ref.current || !options.hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          options.loadMore();
        }
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    observer.observe(options.ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options]);
};
