/**
 * Login Page
 * Uses existing UI components (Input, Button, Card, Form)
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Form, { FormGroup } from "@/components/ui/Form";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasCheckedAuthRef = React.useRef(false);

  // Redirect if already authenticated - but only check once after auth loads
  React.useEffect(() => {
    // Wait until auth has finished loading
    if (!authLoading && !hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true;

      if (isAuthenticated) {
        console.log(
          "[Login] User already authenticated, redirecting to dashboard"
        );
        router.replace("/admin/dashboard");
      } else {
        console.log("[Login] No active session, showing login form");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Show minimal loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-sm text-[var(--foreground-secondary)] font-light tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-semibold mb-3 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MATRUVA
          </h1>
          <p className="text-[var(--foreground-secondary)] text-[17px] font-light tracking-wide">
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" padding="lg" animated>
          <Form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="p-4 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Email Field */}
            <FormGroup>
              <label
                htmlFor="email"
                className="block text-[15px] font-medium mb-2 tracking-tight"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@matruva.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </FormGroup>

            {/* Password Field */}
            <FormGroup>
              <label
                htmlFor="password"
                className="block text-[15px] font-medium mb-2 tracking-tight"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </FormGroup>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-[13px] text-[var(--foreground-secondary)] font-light">
            <p className="tracking-wide">Default admin credentials:</p>
            <p className="font-mono mt-2 text-[12px] tracking-normal">
              owner@example.com / VeryStrongPassword!
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center mt-6 text-[13px] text-[var(--foreground-secondary)] font-light tracking-wide">
          Protected by CSRF-light + RS256 JWT
        </p>
      </div>
    </div>
  );
}
