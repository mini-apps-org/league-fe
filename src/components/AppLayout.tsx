import { Outlet } from 'react-router-dom';

import AppHeader from './AppHeader';

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main
        className="mx-auto w-full max-w-3xl px-4 py-4 lg:max-w-6xl lg:px-6"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
