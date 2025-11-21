"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "./Button";
import Card from "./Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 transition-colors duration-300">
          <Card variant="default" padding="lg" className="max-w-2xl w-full">
            <div className="text-center space-y-4">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[var(--error-bg)] rounded-full flex items-center justify-center transition-colors duration-300">
                  <svg
                    className="w-8 h-8 text-[var(--error)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-[var(--foreground)] transition-colors duration-300">
                Something went wrong
              </h1>

              {/* Error Message */}
              <p className="text-[var(--foreground-secondary)] transition-colors duration-300">
                We apologize for the inconvenience. An unexpected error has
                occurred.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Card variant="outlined" padding="md" className="text-left">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[var(--error)] transition-colors duration-300">
                      Error Details:
                    </h3>
                    <pre className="text-xs text-[var(--foreground-secondary)] overflow-auto p-3 bg-[var(--muted)] rounded-lg transition-colors duration-300">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <>
                        <h3 className="text-sm font-semibold text-[var(--error)] mt-3 transition-colors duration-300">
                          Component Stack:
                        </h3>
                        <pre className="text-xs text-[var(--foreground-secondary)] overflow-auto p-3 bg-[var(--muted)] rounded-lg max-h-48 transition-colors duration-300">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  }
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = "/")}
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  }
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
