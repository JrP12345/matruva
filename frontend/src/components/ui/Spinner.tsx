import React, { memo } from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "gray";
  className?: string;
}

const Spinner = memo<SpinnerProps>(function Spinner({
  size = "md",
  variant = "primary",
  className,
}) {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  const variantStyles = {
    primary:
      "border-[var(--primary)] border-t-transparent transition-colors duration-300",
    white: "border-white border-t-transparent",
    gray: "border-[var(--border)] border-t-transparent transition-colors duration-300",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full animate-spin",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
});

export default Spinner;
