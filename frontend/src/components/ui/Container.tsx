import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, size = "lg", centered = true, ...props }, ref) => {
    const sizeStyles = {
      sm: "max-w-3xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
    };

    const centerStyles = centered ? "mx-auto" : "";

    return (
      <div
        ref={ref}
        className={cn(
          "w-full px-4 sm:px-6 lg:px-8",
          sizeStyles[size],
          centerStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default Container;
