import { Outlet } from 'react-router';

import { SidebarProvider } from '@/components/ui/sidebar';
import { ROLE } from '@/utils';

import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { RoleGate } from './RoleGate';

export const AppLayout = () => {
  return (
    <SidebarProvider className="min-h-dvh bg-background">
      <RoleGate allowed={[ROLE.SUPER_ADMIN]}>
        <AppSidebar />
      </RoleGate>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-280 min-w-0 px-4 pt-5 pb-[max(3rem,env(safe-area-inset-bottom))] lg:px-6 lg:pt-8 lg:pb-16">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
