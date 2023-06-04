import { useEffect } from 'react';

export interface UseInfiniteScrollOptions {
  containerRef: React.RefObject<HTMLElement>;
  hasNextPage: boolean;
  loadMore: () => void;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions) => {
  useEffect(() => {
    console.log({ containerRef: !!options.containerRef.current, hasNextPage: options.hasNextPage });
    if (!options.containerRef.current || !options.hasNextPage) return;
    const container = options.containerRef.current;
    console.log(container.lastElementChild);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const lastChild = container.lastElementChild;
          if (lastChild) {
            console.log('INTERSECTING');
            const lastChildBottom = lastChild.getBoundingClientRect().bottom;
            const containerBottom = container.getBoundingClientRect().bottom;
            if (lastChildBottom <= containerBottom) {
              console.log('LOAD MORE');
              options.loadMore();
            }
          }
        }
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    observer.observe(container.lastElementChild!);

    return () => {
      observer.disconnect();
    };
  }, [options]);
};
