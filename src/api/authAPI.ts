import type { ApiEnvelope } from '@/types/api';
import type { MeResponse } from '@/types/auth';
import { BaseAPI } from './baseAPI';
import { API_BASE, ENDPOINTS } from './endpoints';

class BaseAuthAPI extends BaseAPI {
  // A full-page navigation, never an XHR: axios cannot follow Google's 302, and the user
  // must see accounts.google.com in the address bar.
  getGoogleSignInURL(): string {
    return new URL(ENDPOINTS.AUTH_GOOGLE_LOGIN, API_BASE).toString();
  }

  // The session check: `sid` is HttpOnly, so never infer auth from document.cookie.
  async fetchMe(): Promise<MeResponse> {
    const { data } = await this.get<ApiEnvelope<MeResponse>>(ENDPOINTS.ME);

    return data;
  }

  // 204, no body to unwrap.
  async logout(): Promise<void> {
    await this.post<void>(ENDPOINTS.AUTH_LOGOUT);
  }
}

export const AuthAPI = new BaseAuthAPI();
