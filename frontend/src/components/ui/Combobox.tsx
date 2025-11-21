"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icons, type IconName } from "@/lib/icons";

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: IconName; // Optional icon for each option
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  variant?: "default" | "glass";
  icon?: IconName; // Icon for the combobox field
  showIcon?: boolean; // Toggle icon visibility
}

const Combobox: React.FC<ComboboxProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  className,
  variant = "default",
  icon,
  showIcon = true,
}) => {
  const IconComponent = icon && showIcon ? Icons[icon] : null;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external value prop changes
  useEffect(() => {
    if (value !== selectedValue) {
      setSelectedValue(value || "");
    }
  }, [value]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === selectedValue);

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

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery("");
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
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            "w-full px-4 py-3 rounded-xl text-sm text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
            variantStyles[variant],
            error && "border-[var(--error)]",
            "flex items-center justify-between"
          )}
        >
          <span
            className={cn(
              selectedOption
                ? "text-[var(--foreground)]"
                : "text-[var(--foreground-tertiary)]"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn(
              "w-5 h-5 text-[var(--foreground-tertiary)] transition-transform",
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
            <div className="max-h-60 overflow-y-auto" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[var(--foreground-tertiary)] text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selectedValue === option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full px-4 py-2 text-sm text-left hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]",
                      selectedValue === option.value &&
                        "bg-[var(--primary)]/10 text-[var(--primary)]"
                    )}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-[var(--error)]">{error}</p>}
    </div>
  );
};

export default Combobox;
