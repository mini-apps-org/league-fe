import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig({ command: 'serve', mode: 'test' }),
  defineConfig({
    test: {
      environment: 'jsdom',
      // jsdom's XHR enforces CORS, and axios sends credentials. Serving the test page from the
      // API's dev origin keeps MSW-mocked requests same-origin.
      environmentOptions: { jsdom: { url: 'http://localhost:9200' } },
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  }),
);
