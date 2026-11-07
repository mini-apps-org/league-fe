import type { AxiosRequestConfig } from 'axios';

import axiosInstance from './axios';

export { default as axiosInstance } from './axios';

export interface HttpAPI {
  get<T>(url: string, params?: object, options?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T>;
  patch<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, options?: AxiosRequestConfig): Promise<T>;
}

// Skips null, undefined and '' so an absent filter does not become the literal string
// "undefined" in the query, and repeats the key for an array rather than joining it.
export function serializeParams(params?: object): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        search.append(key, String(entry));
      }
      continue;
    }

    search.append(key, String(value));
  }

  return search.toString();
}

export function withQuery(url: string, params?: object): string {
  const search = serializeParams(params);

  return search === '' ? url : `${url}?${search}`;
}

// The verbs every API shares. Nothing here knows about auth: the CSRF header and the 401
// redirect live on the shared axios instance, so they apply to any API that extends this.
export class BaseAPI implements HttpAPI {
  public async get<T>(url: string, params?: object, options?: AxiosRequestConfig): Promise<T> {
    const { data } = await axiosInstance.get<T>(withQuery(url, params), options);

    return data;
  }

  public async post<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T> {
    const { data } = await axiosInstance.post<T>(url, input, options);

    return data;
  }

  public async put<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T> {
    const { data } = await axiosInstance.put<T>(url, input, options);

    return data;
  }

  public async patch<T>(url: string, input?: object, options?: AxiosRequestConfig): Promise<T> {
    const { data } = await axiosInstance.patch<T>(url, input, options);

    return data;
  }

  public async delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    const { data } = await axiosInstance.delete<T>(url, options);

    return data;
  }
}
