"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Badge from "./Badge";
import { Icons, type IconName } from "@/lib/icons";

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: IconName; // Optional icon for each option
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  variant?: "default" | "glass";
  maxSelections?: number;
  icon?: IconName; // Icon for the multiselect field
  showIcon?: boolean; // Toggle icon visibility
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  label,
  error,
  className,
  variant = "default",
  maxSelections,
  icon,
  showIcon = true,
}) => {
  const IconComponent = icon && showIcon ? Icons[icon] : null;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external value prop changes
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(selectedValues)) {
      setSelectedValues(value);
    }
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    let newValues: string[];

    if (selectedValues.includes(optionValue)) {
      newValues = selectedValues.filter((v) => v !== optionValue);
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return;
      }
      newValues = [...selectedValues, optionValue];
    }

    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const handleRemove = (
    optionValue: string,
    e?: React.MouseEvent | React.KeyboardEvent
  ) => {
    e?.stopPropagation();
    const newValues = selectedValues.filter((v) => v !== optionValue);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const handleClearAll = () => {
    setSelectedValues([]);
    onChange?.([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const variantStyles = {
    default: "bg-[var(--input-background)] border border-[var(--border)]",
    glass:
      "bg-[var(--glass-background)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)]",
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-label={label || placeholder}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 min-h-[48px]",
            variantStyles[variant],
            error && "border-[var(--error)]"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-[var(--foreground-tertiary)]">
                  {placeholder}
                </span>
              ) : (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] leading-4 font-semibold rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                  >
                    {option.label}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(option.value);
                        }
                      }}
                      className="ml-0.5 hover:bg-[var(--error)]/20 hover:text-[var(--error)] rounded-full p-0.5 transition-colors duration-300 cursor-pointer"
                      aria-label={`Remove ${option.label}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </span>
                ))
              )}
            </div>
            <svg
              className={cn(
                "w-5 h-5 text-[var(--foreground-tertiary)] transition-transform flex-shrink-0",
                isOpen && "transform rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            className={cn(
              "absolute z-50 w-full mt-2 rounded-xl overflow-hidden shadow-xl",
              variantStyles[variant]
            )}
          >
            <div className="p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 bg-[var(--muted)] border-none rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--foreground-tertiary)] text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isDisabled =
                    !isSelected &&
                    !!maxSelections &&
                    selectedValues.length >= maxSelections;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !isDisabled && handleToggle(option.value)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full px-4 py-2 text-sm text-left text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors flex items-center gap-2",
                        isSelected &&
                          "bg-[var(--primary)]/10 text-[var(--primary)]",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 border-2 rounded flex items-center justify-center",
                          isSelected
                            ? "bg-[var(--primary)] border-[var(--primary)]"
                            : "border-[var(--border)]"
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-[var(--error)]">{error}</p>}
      {maxSelections && (
        <p className="mt-1 text-xs text-[var(--foreground-tertiary)]">
          {selectedValues.length}/{maxSelections} selected
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
