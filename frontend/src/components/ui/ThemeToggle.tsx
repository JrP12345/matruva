"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Button from "./Button";
import { Icons } from "@/lib/icons";

export interface ThemeToggleProps {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "ghost",
  size = "md",
  showLabel = true,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait until after client-side hydration to show theme-specific content
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render a neutral state
  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => {}}
        icon={<Icons.Sun className="w-5 h-5" />}
      >
        {showLabel && "Theme"}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      icon={
        theme === "dark" ? (
          <Icons.Sun className="w-5 h-5" />
        ) : (
          <Icons.Moon className="w-5 h-5" />
        )
      }
    >
      {showLabel && `${theme === "dark" ? "Light" : "Dark"} Mode`}
    </Button>
  );
};

export default ThemeToggle;
