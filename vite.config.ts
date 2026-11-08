import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // endpoints.ts falls back to localhost, so a missing URL still builds. Fail here, not in prod.
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error('VITE_API_URL must be set for a production build. See .env.example.');
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      host: true,
      port: 5174,
      strictPort: true,
    },
  };
});
