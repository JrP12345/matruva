"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Portal from "./Portal";

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  presetColors?: string[];
  disabled?: boolean;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value = "#3b82f6",
  onChange,
  label,
  presetColors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#64748b",
  ],
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onChange?.(color);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-[13px] font-semibold text-[var(--foreground)] transition-colors duration-300 mb-2 tracking-wide">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 rounded-xl text-[15px] leading-6",
          "bg-[var(--muted)] transition-colors duration-300 border border-[var(--border)]",
          "hover:border-[var(--border)] transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
          "transition-all duration-300",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "flex items-center gap-3"
        )}
      >
        <div
          className="w-8 h-8 rounded-lg border-2 border-[var(--card-background)] shadow-sm transition-colors duration-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="flex-1 text-left text-[var(--foreground)] font-mono transition-colors duration-300">
          {selectedColor}
        </span>
      </button>

      {mounted && isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[99999] w-72 bg-[var(--card-background)] transition-colors duration-300 border border-[var(--border)]  rounded-2xl shadow-2xl p-4 animate-scale-in"
            style={{
              top: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().bottom + 8}px`
                : "0",
              left: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().left}px`
                : "0",
            }}
          >
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                Custom Color
              </label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer border border-[var(--border)] transition-colors duration-300"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                Hex Value
              </label>
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 rounded-lg text-sm font-mono",
                  "bg-[var(--muted)] transition-colors duration-300 border border-[var(--border)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
                  "text-[var(--foreground)] transition-colors duration-300"
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                Preset Colors
              </label>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all duration-300 hover:scale-110",
                      selectedColor === color
                        ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                        : "border-transparent hover:border-[var(--border)]"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ColorPicker;
