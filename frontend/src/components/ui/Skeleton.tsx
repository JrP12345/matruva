import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
}) => {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--muted)] transition-colors duration-300",
        variantStyles[variant],
        className
      )}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard = () => (
  <div className="w-full p-4 bg-[var(--card-background)] transition-colors duration-300 rounded-2xl border border-[var(--border)]">
    <Skeleton variant="rectangular" className="w-full aspect-square mb-4" />
    <Skeleton variant="text" className="w-3/4 mb-2" />
    <Skeleton variant="text" className="w-1/2 mb-4" />
    <Skeleton variant="rectangular" className="w-full h-10" />
  </div>
);

export const SkeletonProductCard = () => (
  <div className="w-full">
    <Skeleton variant="rectangular" className="w-full aspect-square mb-4" />
    <Skeleton variant="text" className="w-full mb-2" />
    <Skeleton variant="text" className="w-2/3 mb-2" />
    <Skeleton variant="text" className="w-1/2" />
  </div>
);

export const SkeletonText = () => (
  <div className="space-y-2">
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-5/6" />
    <Skeleton variant="text" className="w-4/6" />
  </div>
);

export default Skeleton;
