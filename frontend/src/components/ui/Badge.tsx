import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  removable?: boolean;
  onRemove?: () => void;
  dot?: boolean;
  pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      children,
      variant = "default",
      size = "md",
      icon,
      iconPosition = "left",
      removable = false,
      onRemove,
      dot = false,
      pulse = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-1.5 font-semibold rounded-full transition-all duration-300 relative";

    const variantStyles = {
      default:
        "bg-[var(--secondary-bg)] text-[var(--secondary-foreground)] border border-[var(--border)]",
      primary:
        "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20",
      success:
        "bg-[var(--success-bg)] text-[var(--success-foreground)] border border-[var(--success-border)]",
      warning:
        "bg-[var(--warning-bg)] text-[var(--warning-foreground)] border border-[var(--warning-border)]",
      danger:
        "bg-[var(--error-bg)] text-[var(--error-foreground)] border border-[var(--error-border)]",
      info: "bg-[var(--info-bg)] text-[var(--info-foreground)] border border-[var(--info-border)]",
    };

    const sizeStyles = {
      sm: "px-2 py-0.5 text-[11px] leading-4",
      md: "px-2.5 py-1 text-[12px] leading-4",
      lg: "px-3 py-1.5 text-[13px] leading-4",
    };

    const dotColors = {
      default: "bg-gray-500",
      primary: "bg-blue-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      danger: "bg-red-500",
      info: "bg-sky-500",
    };

    const renderContent = () => {
      const content = (
        <>
          {dot && (
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                dotColors[variant],
                pulse && "animate-pulse"
              )}
            />
          )}
          {icon && iconPosition === "left" && (
            <span className="w-3.5 h-3.5">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="w-3.5 h-3.5">{icon}</span>
          )}
          {removable && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="ml-0.5 hover:bg-[var(--hover-overlay)] rounded-full p-0.5 transition-colors duration-300"
              aria-label="Remove badge"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </>
      );

      return content;
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          removable && "pr-1.5",
          className
        )}
        {...props}
      >
        {renderContent()}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
