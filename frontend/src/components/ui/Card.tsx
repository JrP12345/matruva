import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "outlined" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  animated?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      children,
      variant = "default",
      padding = "md",
      hover = false,
      animated = false,
      header,
      footer,
      badge,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "rounded-2xl transition-all duration-400 ease-out overflow-hidden relative";

    const variantStyles = {
      default:
        "bg-[var(--card-background)] border border-[var(--card-border)] shadow-sm",
      glass:
        "bg-[var(--glass-background)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--shadow-glass)]",
      elevated:
        "bg-[var(--card-background)] shadow-xl hover:shadow-2xl border border-[var(--card-border)]",
      outlined:
        "bg-transparent border-1.5 border-[var(--border-secondary)] hover:border-[var(--border-hover)]",
      gradient:
        "bg-gradient-to-br from-blue-50/50 via-[var(--background)] to-purple-50/50 border border-[var(--border)]",
    };

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };

    const hoverStyles = hover
      ? "hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] will-change-transform cursor-pointer"
      : "";

    const animatedStyles = animated ? "animate-fade-in" : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          hoverStyles,
          animatedStyles,
          header || footer ? "" : paddingStyles[padding],
          className
        )}
        {...props}
      >
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 z-10 animate-slide-down">
            {badge}
          </div>
        )}

        {/* Header */}
        {header && (
          <div
            className={cn(
              "border-b border-[var(--border)]",
              paddingStyles[padding]
            )}
          >
            {header}
          </div>
        )}

        {/* Content */}
        <div className={cn(header || footer ? paddingStyles[padding] : "")}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "border-t border-[var(--border)] bg-[var(--background-secondary)]",
              paddingStyles[padding]
            )}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
