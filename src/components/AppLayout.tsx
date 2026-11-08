import { Outlet } from 'react-router';

import { AppHeader } from './AppHeader';

export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:max-w-6xl lg:px-6">
        <Outlet />
      </main>
    </div>
  );
}
