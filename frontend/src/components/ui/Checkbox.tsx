import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, description, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              "w-5 h-5 rounded border-2 border-[var(--border)]",
              "text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
              "checked:bg-[var(--primary)] checked:border-[var(--primary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
              "transition-all duration-300",
              error && "border-[var(--error)]",
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                className={cn(
                  "text-sm font-medium text-[var(--foreground)] cursor-pointer select-none transition-colors duration-300",
                  props.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5 transition-colors duration-300">
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-[var(--error)] mt-1 transition-colors duration-300">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
