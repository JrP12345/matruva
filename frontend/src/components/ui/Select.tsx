import React, { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icons, type IconName } from "@/lib/icons";

export interface SelectOption {
  value: string;
  label: string;
  icon?: IconName; // Optional icon for each option
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "glass" | "outline";
  options: SelectOption[] | { value: string; label: string }[];
  icon?: IconName; // Icon for the select field
  showIcon?: boolean; // Toggle icon visibility
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = "default",
      options,
      icon,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon && showIcon ? Icons[icon] : null;
    const baseStyles =
      "w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]";

    const variantStyles = {
      default:
        "bg-[var(--input-background)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
      glass:
        "bg-[var(--glass-background)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
      outline:
        "bg-transparent border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
    };

    const errorStyles = error
      ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20"
      : "";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Left Icon */}
          {IconComponent && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] pointer-events-none z-10">
              <IconComponent className="w-5 h-5" />
            </div>
          )}

          <select
            ref={ref}
            className={cn(
              baseStyles,
              variantStyles[variant],
              errorStyles,
              IconComponent && "pl-10",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[var(--input-background)] text-[var(--foreground)]"
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Chevron Down Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.ChevronDown className="w-5 h-5 text-[var(--foreground-tertiary)]" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-[var(--error)]">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
