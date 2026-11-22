import { useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const subscribe = (onChange: () => void): (() => void) => {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  };

  const getMatches = (): boolean => {
    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getMatches);
};
