import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icons, type IconName } from "@/lib/icons";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "glass" | "outline";
  icon?: React.ReactNode;
  iconName?: IconName; // Use icon from centralized library
  showIcon?: boolean; // Toggle icon visibility
  iconPosition?: "left" | "right";
  rightElement?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  success?: boolean;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = "default",
      icon,
      iconName,
      showIcon = true,
      iconPosition = "left",
      rightElement,
      clearable = false,
      onClear,
      loading = false,
      success = false,
      labelClassName,
      type = "text",
      value,
      ...props
    },
    ref
  ) => {
    // Get icon from centralized library if iconName is provided
    const IconComponent = iconName ? Icons[iconName] : null;

    // Determine what to display as icon
    let displayIcon = null;
    if (showIcon) {
      if (icon) {
        displayIcon = icon;
      } else if (IconComponent) {
        displayIcon = <IconComponent className="w-5 h-5" />;
      }
    }

    const baseStyles =
      "w-full px-4 py-3 rounded-xl text-[15px] leading-6 transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-[var(--foreground-tertiary)] text-[var(--foreground)]";

    const variantStyles = {
      default:
        "bg-[var(--input-background)] border border-[var(--border)] hover:border-[var(--border-hover)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)] shadow-sm",
      glass:
        "bg-[var(--glass-background)] backdrop-blur-xl border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)] shadow-[var(--shadow-glass)]",
      outline:
        "bg-transparent border-1.5 border-[var(--border-secondary)] hover:border-[var(--border-hover)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)]",
    };

    const stateStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : success
      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
      : "";

    const hasLeftIcon = displayIcon && iconPosition === "left";
    const hasRightContent =
      (displayIcon && iconPosition === "right") ||
      rightElement ||
      clearable ||
      loading ||
      success;

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "block text-[13px] font-semibold text-[var(--foreground)] mb-2 tracking-wide",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] group-focus-within:text-[var(--primary)] transition-colors duration-300">
              {displayIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            ref={ref}
            value={value}
            className={cn(
              baseStyles,
              variantStyles[variant],
              stateStyles,
              hasLeftIcon && "pl-10",
              hasRightContent && "pr-10",
              className
            )}
            {...props}
          />

          {/* Right Content */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Loading Spinner */}
            {loading && (
              <Icons.Loader2 className="animate-spin h-4 w-4 text-blue-500" />
            )}

            {/* Success Icon */}
            {!loading && success && (
              <Icons.CheckCircle className="h-5 w-5 text-green-500 animate-fade-in" />
            )}

            {/* Clear Button */}
            {!loading && clearable && value && (
              <button
                type="button"
                onClick={onClear}
                className="text-[var(--foreground-tertiary)] hover:text-[var(--foreground-secondary)] transition-colors duration-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                aria-label="Clear input"
              >
                <Icons.X className="h-4 w-4" />
              </button>
            )}

            {/* Right Icon */}
            {!loading &&
              !success &&
              !clearable &&
              icon &&
              iconPosition === "right" && (
                <div className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  {icon}
                </div>
              )}

            {/* Custom Right Element */}
            {!loading && rightElement && rightElement}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-slide-down">
            <Icons.AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
