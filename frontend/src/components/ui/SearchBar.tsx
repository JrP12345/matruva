"use client";

import React, { useState } from "react";
import Input from "./Input";
import { cn } from "@/lib/utils";
import { Icons } from "@/lib/icons";

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  variant?: "default" | "glass";
  className?: string;
  showIcon?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search products...",
  onSearch,
  variant = "glass",
  className,
  showIcon = true,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        variant={variant}
        iconName="Search"
        showIcon={showIcon}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--muted)] rounded-full transition-all duration-300"
        >
          <Icons.X className="w-5 h-5 text-[var(--foreground-tertiary)] transition-colors duration-300" />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
