"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import Container from "./Container";
import Badge from "./Badge";

export interface NavLink {
  name: string;
  href: string;
  badge?: string;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  brandName?: string;
  navLinks?: NavLink[];
  cartItemCount?: number;
  showCart?: boolean;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  onCartClick?: () => void;
  onSearch?: (query: string) => void;
  onLogoClick?: () => void;
  className?: string;
  sticky?: boolean;
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  logo,
  brandName,
  navLinks = [],
  cartItemCount = 0,
  showCart = true,
  showSearch = true,
  showThemeToggle = true,
  onCartClick,
  onSearch,
  onLogoClick,
  className,
  sticky = true,
  transparent = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "w-full z-50 transition-all duration-500 ease-out",
        sticky && "sticky top-0",
        transparent && !scrolled
          ? "bg-transparent"
          : "bg-[var(--card-background)]/90 backdrop-blur-2xl border-b border-[var(--border)]/50",
        scrolled && "shadow-sm",
        className
      )}
    >
      <Container size="xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div
            onClick={onLogoClick}
            role={onLogoClick ? "button" : undefined}
            tabIndex={onLogoClick ? 0 : undefined}
            onKeyDown={
              onLogoClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onLogoClick();
                    }
                  }
                : undefined
            }
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              onLogoClick && "cursor-pointer hover:opacity-80 active:scale-95"
            )}
            aria-label={brandName ? `${brandName} home` : "Home"}
          >
            {logo ? (
              logo
            ) : brandName ? (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg transform hover:scale-110 transition-transform"></div>
                <span className="text-xl font-bold text-[var(--foreground)]">
                  {brandName}
                </span>
              </>
            ) : null}
          </div>

          {/* Desktop Navigation */}
          {navLinks.length > 0 && (
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--primary)] transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                  {link.badge && (
                    <span className="absolute -top-2 -right-3 px-1.5 py-0.5 text-xs font-bold bg-[var(--error)] text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
          )}

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar
                variant="glass"
                placeholder="Search products..."
                onSearch={onSearch}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <ThemeToggle variant="ghost" size="sm" showLabel={false} />
            )}

            {/* Cart */}
            {showCart && (
              <button
                onClick={onCartClick}
                aria-label={`Shopping cart with ${cartItemCount} items`}
                className="relative p-2 hover:bg-[var(--muted)] rounded-lg transition-all duration-300 group"
              >
                <svg
                  className="w-6 h-6 text-[var(--foreground-secondary)] group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[var(--error)] text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            {navLinks.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-[var(--muted)] rounded-lg transition-all duration-300"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-[var(--foreground-secondary)] transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    transform: mobileMenuOpen
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <SearchBar
              variant="glass"
              placeholder="Search..."
              onSearch={onSearch}
            />
          </div>
        )}
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && navLinks.length > 0 && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card-background)]/95 backdrop-blur-lg animate-slide-up">
          <Container size="xl">
            <div className="py-4 space-y-1">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--muted)] rounded-lg transition-all duration-300 hover:translate-x-1"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    animation: `slideUp 0.3s ease-out ${index * 50}ms`,
                  }}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-[var(--error)] text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
