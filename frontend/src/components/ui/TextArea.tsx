import React, { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "glass" | "outline";
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = "default",
      rows = 4,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)]";

    const variantStyles = {
      default:
        "bg-[var(--input-background)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)]",
      glass:
        "bg-[var(--glass-background)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--shadow-glass)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)]",
      outline:
        "bg-transparent border-2 border-[var(--border-secondary)] focus:border-[var(--primary)] focus:ring-[var(--focus-ring)]",
    };

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            baseStyles,
            variantStyles[variant],
            errorStyles,
            className
          )}
          {...props}
        />
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

TextArea.displayName = "TextArea";

export default TextArea;
