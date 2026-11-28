import '@testing-library/jest-dom/vitest';
import '@/i18n';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { resetLeagueStore } from './mocks/league-store';
import { server } from './server';

// jsdom has no matchMedia; shadcn's useIsMobile calls it when SidebarProvider mounts.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {
        return undefined;
      },
      removeEventListener: () => {
        return undefined;
      },
      addListener: () => {
        return undefined;
      },
      removeListener: () => {
        return undefined;
      },
      dispatchEvent: () => {
        return false;
      },
    };
  },
});

// jsdom has no pointer capture or scrollIntoView. Radix Select calls them when it opens on a
// pointer press, so without these a test can't open one:
// https://github.com/testing-library/user-event/discussions/1087
Element.prototype.hasPointerCapture = () => {
  return false;
};
Element.prototype.setPointerCapture = () => {
  return undefined;
};
Element.prototype.releasePointerCapture = () => {
  return undefined;
};
Element.prototype.scrollIntoView = () => {
  return undefined;
};

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

beforeEach(() => {
  resetLeagueStore();
});

// Vitest globals are off, so Testing Library cannot register its own cleanup.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
