"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

const Carousel = memo<CarouselProps>(function Carousel({
  items,
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (autoPlay && !isHovered) {
      const timer = setInterval(goToNext, interval);
      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, isHovered, goToNext]);

  return (
    <div
      className={cn("relative rounded-2xl overflow-hidden group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--muted)] transition-colors duration-300">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-500 ease-in-out",
              index === currentIndex
                ? "opacity-100 translate-x-0 z-10 scale-100"
                : index < currentIndex
                ? "opacity-0 -translate-x-full scale-95"
                : "opacity-0 translate-x-full scale-95"
            )}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full bg-[var(--card-background)]/90 backdrop-blur-md",
              "border border-[var(--border)] shadow-lg",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-all duration-300",
              "hover:scale-110 active:scale-95",
              "text-[var(--foreground)]"
            )}
          >
            <svg
              className="w-6 h-6"
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
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-20",
              "w-12 h-12 rounded-full bg-[var(--card-background)]/90 backdrop-blur-md",
              "border border-[var(--border)] shadow-lg",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-all duration-300",
              "hover:scale-110 active:scale-95",
              "text-[var(--foreground)]"
            )}
          >
            <svg
              className="w-6 h-6"
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
        </>
      )}

      {/* Dots */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-400 ease-out",
                index === currentIndex
                  ? "bg-white w-8 shadow-lg"
                  : "bg-white/60 w-1.5 hover:bg-white/80 hover:w-4"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default Carousel;
