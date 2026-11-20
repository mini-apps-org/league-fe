import { useSyncExternalStore } from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const subscribe = (onChange: () => void): (() => void) => {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener('change', onChange);

  return () => {
    mediaQuery.removeEventListener('change', onChange);
  };
};

const getIsMobile = (): boolean => {
  return window.matchMedia(MOBILE_QUERY).matches;
};

export const useIsMobile = (): boolean => {
  return useSyncExternalStore(subscribe, getIsMobile);
};
