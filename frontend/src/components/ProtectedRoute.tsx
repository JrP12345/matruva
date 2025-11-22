/**
 * Protected Route Component
 *
 * Wraps admin pages and redirects to login if not authenticated
 * Shows loading spinner while checking auth state
 */

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/ui/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
}) => {
  const router = useRouter();
  const { user, loading, isAuthenticated, hasPermission, hasRole } = useAuth();
  const hasRedirectedRef = React.useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      console.log("[ProtectedRoute] Not authenticated, redirecting to login");
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner with Apple style
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center animate-fade-in">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-[15px] text-[var(--foreground-secondary)] font-light tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 ">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-7xl mb-6">🔒</div>
          <h1 className="text-[32px] font-semibold mb-3 tracking-tight">
            Access Denied
          </h1>
          <p className="text-[17px] text-[var(--foreground-secondary)] font-light tracking-wide">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 ">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-7xl mb-6">🔒</div>
          <h1 className="text-[32px] font-semibold mb-3 tracking-tight">
            Access Denied
          </h1>
          <p className="text-[17px] text-[var(--foreground-secondary)] font-light tracking-wide">
            This page requires {requiredRole} role.
          </p>
        </div>
      </div>
    );
  }

  // Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
