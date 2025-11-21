"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 3000;
    setTimeout(() => {
      hideToast(id);
    }, duration);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onClose: (id: string) => void;
}> = ({ toast, onClose }) => {
  const typeConfig = {
    success: {
      bg: "bg-[var(--success-bg)] border-[var(--success-border)] transition-colors duration-300",
      icon: "text-[var(--success-foreground)] transition-colors duration-300",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    error: {
      bg: "bg-[var(--error-bg)] border-[var(--error-border)] transition-colors duration-300",
      icon: "text-[var(--error-foreground)] transition-colors duration-300",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    warning: {
      bg: "bg-[var(--warning-bg)] border-[var(--warning-border)] transition-colors duration-300",
      icon: "text-[var(--warning-foreground)] transition-colors duration-300",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
    info: {
      bg: "bg-[var(--info-bg)] border-[var(--info-border)] transition-colors duration-300",
      icon: "text-[var(--info-foreground)] transition-colors duration-300",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const config = typeConfig[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto min-w-[320px] max-w-md p-4 rounded-xl border shadow-lg backdrop-blur-xl",
        "animate-slide-down transition-all duration-300",
        config.bg
      )}
    >
      <div className="flex items-start gap-3">
        <svg
          className={cn("w-6 h-6 flex-shrink-0", config.icon)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={config.iconPath}
          />
        </svg>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-semibold text-[var(--foreground)] mb-1 transition-colors duration-300">
              {toast.title}
            </p>
          )}
          <p className="text-sm text-[var(--foreground)] transition-colors duration-300">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] transition-colors duration-300"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToastProvider;
