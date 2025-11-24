"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Button from "@/components/ui/Button";
import { Icons } from "@/lib/icons";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Detect page type
  const isAdminPage = pathname?.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Hide navbar on auth pages
  const showNavbar = !isAuthPage;

  // Public navigation links
  const publicNavLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    ...(isAuthenticated
      ? [{ name: "My Orders", href: "/account/orders" }]
      : []),
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Admin navigation links
  const adminNavLinks = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Products", href: "/admin/products" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Users", href: "#" },
    { name: "Roles", href: "#" },
    { name: "Audit", href: "#" },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {showNavbar && (
        <Navbar
          brandName={isAdminPage ? "MATRUVA Admin" : "MATRUVA"}
          navLinks={isAdminPage ? adminNavLinks : publicNavLinks}
          cartItemCount={isAdminPage ? 0 : getCartCount()}
          showCart={!isAdminPage}
          showSearch={!isAdminPage}
          showThemeToggle={true}
          onCartClick={() => router.push("/cart")}
          onLogoClick={() =>
            router.push(isAdminPage ? "/admin/dashboard" : "/")
          }
          sticky={true}
        />
      )}
      {/* Quick Navigation Button - Only show when logged in and not on auth pages */}
      {isAuthenticated && user && !isAuthPage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(isAdminPage ? "/" : "/admin/dashboard")}
            icon={
              isAdminPage ? (
                <Icons.Home className="w-5 h-5" />
              ) : (
                <Icons.LayoutDashboard className="w-5 h-5" />
              )
            }
            className="shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            {isAdminPage ? "Shop" : "Dashboard"}
          </Button>
        </div>
      )}
      <main className="flex-1">{children}</main>
      {!isAuthPage && (
        <Footer
          brandName="MATRUVA"
          tagline="Your trusted e-commerce destination for quality products"
          socialLinks={{
            facebook: "https://facebook.com",
            twitter: "https://twitter.com",
            instagram: "https://instagram.com",
            linkedin: "https://linkedin.com",
          }}
          showPaymentMethods={true}
        />
      )}
    </div>
  );
}
