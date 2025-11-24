"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  brandName?: string;
  tagline?: string;
  sections?: FooterSection[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  showPaymentMethods?: boolean;
  copyrightText?: string;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  brandName = "MATRUVA",
  tagline = "Your trusted e-commerce destination",
  sections = [],
  socialLinks,
  showPaymentMethods = true,
  copyrightText,
  className,
}) => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const defaultSections: FooterSection[] = [
    {
      title: "Shop",
      links: [
        { name: "All Products", href: "/products" },
        { name: "New Arrivals", href: "/products?sort=newest" },
        { name: "Best Sellers", href: "/products?sort=popular" },
        { name: "Sale", href: "/products?sale=true" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Shipping Info", href: "#" },
        { name: "Returns", href: "#" },
        { name: "Track Order", href: "/account/orders" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Cookie Policy", href: "#" },
        { name: "Disclaimer", href: "#" },
      ],
    },
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <footer
      className={cn(
        "bg-[var(--muted)]/30 border-t border-[var(--border)] mt-auto",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <button
              onClick={() => router.push("/")}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 hover:opacity-80 transition-opacity"
            >
              {brandName}
            </button>
            <p className="text-sm text-[var(--foreground-secondary)] mb-4">
              {tagline}
            </p>
            {/* Social Links */}
            {socialLinks && (
              <div className="flex gap-3">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--muted-hover)] flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Icons.Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--muted-hover)] flex items-center justify-center transition-colors"
                    aria-label="Twitter"
                  >
                    <Icons.Twitter className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--muted-hover)] flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Icons.Instagram className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--muted-hover)] flex items-center justify-center transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Icons.Linkedin className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[var(--muted)] hover:bg-[var(--muted-hover)] flex items-center justify-center transition-colors"
                    aria-label="YouTube"
                  >
                    <Icons.Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {displaySections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div className="border-t border-[var(--border)] pt-8 mb-8">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              We Accept
            </h3>
            <div className="flex flex-wrap gap-3">
              {["Visa", "Mastercard", "AmEx", "PayPal", "UPI", "Razorpay"].map(
                (method) => (
                  <div
                    key={method}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-[var(--border)] rounded text-xs font-medium text-[var(--foreground-secondary)]"
                  >
                    {method}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-[var(--border)] pt-8 text-center">
          <p className="text-sm text-[var(--foreground-secondary)]">
            {copyrightText ||
              `© ${currentYear} ${brandName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
