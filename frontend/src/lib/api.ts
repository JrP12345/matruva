/**
 * Axios API client with automatic token refresh
 *
 * Features:
 * - Automatic Bearer token injection
 * - 401 handling with refresh token rotation
 * - Request queuing during refresh
 * - CSRF protection on refresh endpoint
 * - Credentials (cookies) included
 */

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, AUTH_ENDPOINTS, AUTH_CONFIG } from "./constants";
import { getAccessToken, setAccessToken, clearAccessToken } from "./authToken";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (refresh_token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh state
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribe to token refresh completion
 */
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

/**
 * Notify all subscribers when refresh completes
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

/**
 * Request interceptor: Add Bearer token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: Handle 401 with refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or already retried, reject
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // If this is the refresh endpoint itself failing, just reject
    // Let the caller (AuthContext) handle the error
    if (originalRequest.url?.includes(AUTH_ENDPOINTS.REFRESH)) {
      clearAccessToken();
      return Promise.reject(error);
    }

    // Mark request as retried
    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        // Call refresh endpoint with CSRF header
        const response = await axios.post(
          `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
          {},
          {
            withCredentials: true,
            headers: {
              [AUTH_CONFIG.CSRF_HEADER_NAME]: AUTH_CONFIG.CSRF_HEADER_VALUE,
            },
          }
        );

        const { accessToken: newToken } = response.data;
        setAccessToken(newToken);

        // Notify all queued requests
        onTokenRefreshed(newToken);
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearAccessToken();

        // Don't redirect here - let components handle navigation
        // This prevents infinite reload loops
        return Promise.reject(refreshError);
      }
    }

    // Queue this request while refresh is in progress
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        resolve(api(originalRequest));
      });
    });
  }
);

export default api;
