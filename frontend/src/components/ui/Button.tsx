import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/lib/icons";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  rounded?: "sm" | "md" | "lg" | "full";
  shadow?: "none" | "sm" | "md" | "lg";
  animation?: "none" | "pulse" | "bounce" | "scale";
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      rounded = "lg",
      shadow = "none",
      animation = "scale",
      loadingText = "Loading...",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus:shadow-[0_0_0_3px_var(--focus-ring)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden select-none active:scale-[0.98] will-change-transform";

    const variantStyles = {
      primary:
        "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] shadow-[var(--shadow-md)]",
      secondary:
        "bg-[var(--secondary-bg)] text-[var(--secondary-foreground)] hover:bg-[var(--hover-overlay-secondary)] border border-[var(--border)]",
      ghost:
        "bg-transparent text-[var(--foreground)] hover:bg-[var(--hover-overlay)] active:bg-[var(--hover-overlay-secondary)]",
      outline:
        "bg-transparent border-1.5 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--hover-overlay)] hover:border-[var(--border-hover)] active:bg-[var(--hover-overlay-secondary)]",
      glass:
        "bg-[var(--glass-background)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--shadow-glass)] hover:bg-[var(--glass-hover)] hover:shadow-[var(--shadow-glass-hover)] text-[var(--foreground)]",
      danger:
        "bg-[var(--error)] text-white hover:opacity-90 active:opacity-80 shadow-[var(--shadow-md)]",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-[13px] leading-5",
      md: "px-5 py-2.5 text-sm leading-6",
      lg: "px-7 py-3.5 text-[15px] leading-6",
    };

    const roundedStyles = {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      full: "rounded-full",
    };

    const shadowStyles = {
      none: "",
      sm: "shadow-sm hover:shadow-md",
      md: "shadow-md hover:shadow-lg",
      lg: "shadow-lg hover:shadow-2xl",
    };

    const animationStyles = {
      none: "",
      pulse: "hover:animate-pulse",
      bounce: "active:animate-press",
      scale:
        "hover:scale-[1.02] will-change-transform active:scale-[0.98] will-change-transform",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Icons.Loader2 className="animate-spin h-5 w-5" />
            {loadingText && <span>{loadingText}</span>}
          </>
        );
      }

      if (icon && iconPosition === "right") {
        return (
          <>
            {children}
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              {icon}
            </span>
          </>
        );
      }

      return (
        <>
          {icon && (
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              {icon}
            </span>
          )}
          {children}
        </>
      );
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          roundedStyles[rounded],
          shadowStyles[shadow],
          animationStyles[animation],
          widthStyles,
          "group",
          className
        )}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
