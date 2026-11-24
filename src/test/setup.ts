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
