import type { ApiEnvelope } from '@/types/api';
import type { MeResponse } from '@/types/auth';
import { BaseAPI } from './baseAPI';
import { API_BASE, ENDPOINTS } from './endpoints';

class BaseAuthAPI extends BaseAPI {
  // A full-page navigation, never an XHR: axios cannot follow Google's 302, and the user
  // must see accounts.google.com in the address bar.
  getGoogleSignInURL(): string {
    console.log()
    return new URL(ENDPOINTS.AUTH_GOOGLE_LOGIN, API_BASE).toString();
  }

  // This *is* the session check. The SPA cannot read the HttpOnly `sid` cookie, so it has to
  // ask; never infer auth from document.cookie.
  async fetchMe(): Promise<MeResponse> {
    const { data } = await this.get<ApiEnvelope<MeResponse>>(ENDPOINTS.ME);

    return data;
  }

  // 204 with no body, so there is nothing to unwrap.
  async logout(): Promise<void> {
    await this.post<void>(ENDPOINTS.AUTH_LOGOUT);
  }
}

export const AuthAPI = new BaseAuthAPI();
