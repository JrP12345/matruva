"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  label?: string;
  error?: string;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  error,
  className,
  orientation = "vertical",
}) => {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-3">
          {label}
        </label>
      )}
      <div
        className={cn(
          "space-y-3",
          orientation === "horizontal" && "flex flex-wrap gap-4 space-y-0"
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 cursor-pointer group",
              orientation === "horizontal" && "flex-shrink-0"
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 border-[var(--border)] transition-colors duration-300",
                  "text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
                  "checked:bg-[var(--primary)] checked:border-[var(--primary)]",
                  "cursor-pointer",
                  error && "border-[var(--error-border)]"
                )}
              />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-[var(--foreground-secondary)] transition-colors duration-300 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default RadioGroup;
