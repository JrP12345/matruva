/**
 * In-memory access token storage
 * Never stored in localStorage/sessionStorage for security
 *
 * This token is lost on page refresh, which is expected.
 * The app will call /v1/auth/refresh on mount to get a new one.
 */

let accessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};
