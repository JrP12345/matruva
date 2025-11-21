"use client";

import React, { useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/lib/icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  variant?: "default" | "glass" | "centered";
  animation?: "scale" | "slide" | "fade";
  className?: string;
}

const Modal = memo<ModalProps>(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  variant = "default",
  animation = "scale",
  className,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw]",
  };

  const variantStyles = {
    default:
      "bg-[var(--card-background)] border border-[var(--border)] transition-colors duration-300",
    glass:
      "bg-[var(--glass-background)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-colors duration-300",
    centered:
      "bg-[var(--card-background)] border border-[var(--border)] transition-colors duration-300",
  };
  const animationStyles = {
    scale: "animate-scale-in",
    slide: "animate-slide-down",
    fade: "animate-fade-in",
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-colors duration-300"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full rounded-3xl shadow-2xl",
          "transform transition-all duration-400 ease-out",
          sizeStyles[size],
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] transition-colors duration-300">
            {title && (
              <h2 className="text-xl font-bold text-[var(--foreground)] transition-colors duration-300">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--muted)] rounded-xl transition-all duration-300 hover:rotate-90 active:scale-90"
                aria-label="Close modal"
              >
                <Icons.X className="w-5 h-5 text-[var(--foreground-tertiary)]" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "px-6 py-4 overflow-y-auto",
            footer ? "max-h-[calc(100vh-280px)]" : "max-h-[calc(100vh-200px)]"
          )}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)] transition-colors duration-300">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

export default Modal;
