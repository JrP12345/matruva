"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      // Check localStorage or system preference on mount
      const savedTheme = localStorage.getItem("theme") as Theme | null;

      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Use system preference if no saved theme
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }

      setMounted(true);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem("theme");
        // Only update if user hasn't manually set a theme
        if (!savedTheme) {
          const newTheme = e.matches ? "dark" : "light";
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch (error) {
      console.error("Error initializing theme:", error);
      setMounted(true);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    try {
      const root = document.documentElement;
      if (newTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    try {
      if (newTheme !== "light" && newTheme !== "dark") {
        console.error("Invalid theme value:", newTheme);
        return;
      }
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
