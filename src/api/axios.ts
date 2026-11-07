import axios, { type AxiosError, type AxiosInstance } from 'axios';

import { CSRF_HEADER, needsCSRFToken, readCSRFToken } from '@/lib/csrf';
import { toApiError } from '@/lib/errors';
import { redirectToLogin } from '@/lib/navigate';
import { API_BASE, ENDPOINTS } from './endpoints';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  if (needsCSRFToken(config.method)) {
    const token = readCSRFToken();
    if (token !== null) {
      config.headers[CSRF_HEADER] = token;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(undefined, (error: AxiosError) => {
  const apiErr = toApiError(error);

  // A 401 is terminal: no refresh endpoint, so recovery is a fresh Google login. /me is
  // exempt — a 401 there means "not signed in", and RequireAuth renders <Navigate>, which a
  // hard redirect would rob of location.state.from.
  const isSessionProbe = (error.config?.url ?? '').includes(ENDPOINTS.ME);

  if (apiErr.status === 401 && !isSessionProbe) {
    redirectToLogin();
  }

  return Promise.reject(apiErr);
});

export default axiosInstance;
