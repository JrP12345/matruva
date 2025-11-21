"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-colors duration-300"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn(
                  isLast
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--foreground-secondary)]"
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <svg
                className="w-4 h-4 text-[var(--foreground-tertiary)]"
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
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
