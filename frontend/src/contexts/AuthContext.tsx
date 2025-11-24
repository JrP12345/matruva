/**
 * Authentication Context
 *
 * Provides:
 * - User state & permissions
 * - login(), logout() functions
 * - Bootstrap logic (silent refresh on mount)
 * - Loading states
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/api";
import { setAccessToken, clearAccessToken } from "@/lib/authToken";
import { AUTH_ENDPOINTS, AUTH_CONFIG } from "@/lib/constants";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
}

export interface AuthContextType {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initializingRef = React.useRef(false);
  const initializedRef = React.useRef(false);
  const mountedRef = React.useRef(false);

  /**
   * Fetch current user + permissions from /v1/auth/me
   */
  const fetchUser = async () => {
    try {
      const response = await api.get(AUTH_ENDPOINTS.ME);
      const { user: userData, permissions: userPermissions } = response.data;

      setUser(userData);
      setPermissions(userPermissions || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      clearAccessToken();
    }
  };

  /**
   * Initialize auth (called once at app startup)
   * Using refs to prevent multiple calls
   */
  const initialize = useCallback(async () => {
    // Only allow one initialization globally
    if (initializingRef.current || initializedRef.current) {
      return;
    }

    initializingRef.current = true;
    setLoading(true);

    try {
      // Try to refresh using httpOnly cookie
      const response = await api.post(
        AUTH_ENDPOINTS.REFRESH,
        {},
        {
          headers: {
            [AUTH_CONFIG.CSRF_HEADER_NAME]: AUTH_CONFIG.CSRF_HEADER_VALUE,
          },
        }
      );

      const { accessToken } = response.data;
      setAccessToken(accessToken);

      // Fetch user info
      await fetchUser();
      initializedRef.current = true;
    } catch (error: any) {
      clearAccessToken();
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      initializedRef.current = true;
    } finally {
      setLoading(false);
      initializingRef.current = false;
    }
  }, []); // Empty deps - stable function reference, called once

  /**
   * Auto-initialize on mount (once per app lifetime)
   */
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      initialize();
    }
  }, [initialize]);

  /**
   * Login: POST /v1/auth/login
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      const { accessToken, user: userData } = response.data;

      setAccessToken(accessToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Fetch full permissions
      await fetchUser();
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  /**
   * Logout: POST /v1/auth/logout
   */
  const logout = async () => {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear state regardless of API result
      setUser(null);
      setPermissions([]);
      setIsAuthenticated(false);
      clearAccessToken();
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    // Check for wildcard permission (super admin)
    if (permissions.includes("*")) {
      return true;
    }
    return permissions.includes(permission);
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Refresh user data (useful after role/permission changes)
   */
  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    permissions,
    isAuthenticated,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUser,
    initialize,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
