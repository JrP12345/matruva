"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import Spinner from "./Spinner";

export interface LoadingOverlayProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
  blur?: boolean;
  className?: string;
}

const LoadingOverlay = memo<LoadingOverlayProps>(function LoadingOverlay({
  text = "Loading...",
  size = "lg",
  blur = true,
  className,
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col items-center justify-center",
        blur && "backdrop-blur-sm bg-[var(--background)]/80",
        !blur && "bg-[var(--background)]",
        className
      )}
    >
      <Spinner size={size} variant="primary" />
      {text && (
        <p className="mt-4 text-[var(--foreground)] font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
});

export default LoadingOverlay;
