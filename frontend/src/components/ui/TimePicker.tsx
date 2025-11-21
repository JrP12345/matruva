"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Portal from "./Portal";

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  label?: string;
  format?: "12" | "24";
  disabled?: boolean;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  label,
  format = "12",
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
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

  const handleSelect = () => {
    const timeString =
      format === "12" ? `${hours}:${minutes} ${period}` : `${hours}:${minutes}`;
    onChange?.(timeString);
    setIsOpen(false);
  };

  const hourOptions =
    format === "12"
      ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
      : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

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
          "w-full px-4 py-3 rounded-xl text-[15px] leading-6 text-left",
          "bg-[var(--muted)] transition-colors duration-300 border border-[var(--border)] ",
          "hover:border-[var(--border)] transition-colors duration-300",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
          "transition-all duration-300",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "flex items-center justify-between"
        )}
      >
        <span
          className={
            value
              ? "text-[var(--foreground)] transition-colors duration-300"
              : "text-[var(--foreground-tertiary)] transition-colors duration-300"
          }
        >
          {value || placeholder}
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {mounted && isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[99999] w-64 bg-[var(--card-background)] transition-colors duration-300 border border-[var(--border)]  rounded-2xl shadow-2xl p-4 animate-scale-in"
            style={{
              top: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().bottom + 8}px`
                : "0",
              left: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().left}px`
                : "0",
            }}
          >
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                  Hours
                </label>
                <div className="h-32 overflow-y-auto border border-[var(--border)] transition-colors duration-300 rounded-lg">
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => setHours(hour)}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-center transition-colors",
                        hours === hour
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors duration-300 font-semibold"
                          : "hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors duration-300"
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                  Minutes
                </label>
                <div className="h-32 overflow-y-auto border border-[var(--border)] transition-colors duration-300 rounded-lg">
                  {minuteOptions
                    .filter((_, i) => i % 5 === 0)
                    .map((minute) => (
                      <button
                        key={minute}
                        onClick={() => setMinutes(minute)}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-center transition-colors",
                          minutes === minute
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors duration-300 font-semibold"
                            : "hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors duration-300"
                        )}
                      >
                        {minute}
                      </button>
                    ))}
                </div>
              </div>

              {format === "12" && (
                <div className="w-16">
                  <label className="block text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 mb-2">
                    Period
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setPeriod("AM")}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg transition-colors",
                        period === "AM"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors duration-300 font-semibold"
                          : "border border-[var(--border)] transition-colors duration-300 hover:bg-[var(--muted)]"
                      )}
                    >
                      AM
                    </button>
                    <button
                      onClick={() => setPeriod("PM")}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg transition-colors",
                        period === "PM"
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors duration-300 font-semibold"
                          : "border border-[var(--border)] transition-colors duration-300 hover:bg-[var(--muted)]"
                      )}
                    >
                      PM
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSelect}
              className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] transition-colors duration-300 rounded-xl font-semibold hover:bg-blue-500 transition-colors"
            >
              Set Time
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default TimePicker;
