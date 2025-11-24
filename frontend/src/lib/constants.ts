/**
 * Backend API Constants
 * These match the backend endpoints from openapi.yaml
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/v1/auth/login",
  REGISTER: "/v1/auth/register",
  LOGOUT: "/v1/auth/logout",
  REFRESH: "/v1/auth/refresh",
  ME: "/v1/auth/me",
} as const;

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: "/v1/admin/dashboard",
  USERS: "/v1/admin/users",
  ROLES: "/v1/admin/roles",
  PERMISSIONS: "/v1/admin/permissions",
  AUDIT: "/v1/admin/audit",
} as const;

// Cookie & Token config
export const AUTH_CONFIG = {
  REFRESH_COOKIE_NAME: "refresh_token",
  CSRF_HEADER_NAME: "X-Auth-Refresh",
  CSRF_HEADER_VALUE: "1",
  ACCESS_TOKEN_KEY: "accessToken",
} as const;

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
