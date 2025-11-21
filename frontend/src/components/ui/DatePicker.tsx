"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Portal from "./Portal";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  minDate,
  maxDate,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
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

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            selectedDate
              ? "text-[var(--foreground)] transition-colors duration-300"
              : "text-[var(--foreground-tertiary)] transition-colors duration-300"
          }
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {mounted && isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed z-[99999] w-80 bg-[var(--card-background)] transition-colors duration-300 border border-[var(--border)]  rounded-2xl shadow-2xl animate-scale-in"
            style={{
              top: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().bottom + 8}px`
                : "0",
              left: wrapperRef.current
                ? `${wrapperRef.current.getBoundingClientRect().left}px`
                : "0",
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-[var(--muted)] transition-all duration-300 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-[var(--foreground)] transition-colors duration-300">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[var(--muted)] transition-all duration-300 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-[var(--foreground-secondary)] transition-colors duration-300 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDayOfMonth)].map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === currentMonth.getMonth() &&
                    selectedDate?.getFullYear() === currentMonth.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "p-2 text-sm rounded-lg transition-all duration-300",
                        isSelected
                          ? "bg-blue-600 text-white font-semibold"
                          : "hover:bg-[var(--muted)] transition-all duration-300 text-[var(--foreground)] transition-colors duration-300"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default DatePicker;
