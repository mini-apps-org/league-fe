export const LOGIN_PATH = '/login';
export const ONBOARDING_PATH = '/onboarding';

export function redirectToLogin(): void {
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
}
