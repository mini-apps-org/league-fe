import { ROUTES } from '@/utils';

export const redirectToLogin = (): void => {
  if (window.location.pathname !== ROUTES.LOGIN) {
    window.location.assign(ROUTES.LOGIN);
  }
};
