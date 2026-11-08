import '@testing-library/jest-dom/vitest';
import '@/i18n';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' });
});

// Vitest globals are off, so Testing Library cannot register its own cleanup.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});
