import { setupWorker } from 'msw/browser';

import { sessionHandlers } from './handlers/sessions';

// Dev only: just the session routes, which league-be does not serve yet. Everything else,
// sign-in and /me included, passes through to the real backend.
export const worker = setupWorker(...sessionHandlers);
