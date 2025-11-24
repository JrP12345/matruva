"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Container,
  ProductCard,
  Icons,
  Carousel,
} from "@/components/ui";
import { API_BASE_URL } from "@/lib/constants";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  priceMinor: number;
  currency: string;
  stock: number;
  images: string[];
  category?: string;
}

// Static content that can be made dynamic later
const HERO_CONTENT = {
  title: "Welcome to MATRUVA",
  subtitle: "Discover Premium Products for Every Lifestyle",
  description:
    "Curated collection of high-quality products at unbeatable prices",
  ctaText: "Shop Now",
  ctaLink: "/products",
};

const FEATURES = [
  {
    icon: "Truck",
    title: "Free Shipping",
    description: "On orders over ₹999",
  },
  {
    icon: "Shield",
    title: "Secure Payment",
    description: "100% secure transactions",
  },
  {
    icon: "RefreshCw",
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: "Headphones",
    title: "24/7 Support",
    description: "Dedicated customer service",
  },
];

const CATEGORIES = [
  {
    name: "Electronics",
    icon: "Laptop",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    link: "/products?category=electronics",
  },
  {
    name: "Fashion",
    icon: "ShoppingBag",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    link: "/products?category=fashion",
  },
  {
    name: "Home & Living",
    icon: "Home",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop",
    link: "/products?category=home",
  },
  {
    name: "Sports",
    icon: "Zap",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
    link: "/products?category=sports",
  },
];

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchBestsellers();
  }, []);

  const fetchBestsellers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/products?limit=4&sort=created_desc`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Carousel Section - Full Width */}
      <div className="w-full">
        <Carousel
          autoPlay={true}
          interval={4000}
          showDots={true}
          showArrows={true}
          className="rounded-none md:rounded-2xl md:mx-4 lg:mx-8"
          items={[
            // Slide 1 - Main Hero
            <div
              key="slide-1"
              className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight animate-fade-in">
                  {HERO_CONTENT.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-white/90">
                  {HERO_CONTENT.subtitle}
                </p>
                <p className="text-base mb-6 text-white/80">
                  {HERO_CONTENT.description}
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => router.push(HERO_CONTENT.ctaLink)}
                  icon={<Icons.ShoppingBag className="w-5 h-5" />}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  {HERO_CONTENT.ctaText}
                </Button>
              </div>
            </div>,
            // Slide 2 - New Arrivals
            <div
              key="slide-2"
              className="relative w-full h-full bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
                  🆕
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
                  New Arrivals
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-white/90">
                  Check out our latest products
                </p>
                <p className="text-base mb-6 text-white/80">
                  Fresh styles, hot deals
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => router.push("/products?sort=newest")}
                  icon={<Icons.Sparkle className="w-5 h-5" />}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  Explore New
                </Button>
              </div>
            </div>,
            // Slide 3 - Special Offer
            <div
              key="slide-3"
              className="relative w-full h-full bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 text-white flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
                  🔥
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
                  Special Offers
                </h2>
                <p className="text-base sm:text-lg md:text-xl mb-2 sm:mb-3 text-white/90">
                  Up to 50% off on selected items
                </p>
                <p className="text-base mb-6 text-white/80">
                  Limited time deals
                </p>
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => router.push("/products?sale=true")}
                  icon={<Icons.Tag className="w-5 h-5" />}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  Shop Sale
                </Button>
              </div>
            </div>,
          ]}
        />
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-16 bg-[var(--muted)]/30">
        <Container size="xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = Icons[feature.icon as keyof typeof Icons];
              return (
                <Card
                  key={index}
                  variant="glass"
                  padding="lg"
                  className="text-center hover:scale-105 transition-transform"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                      {Icon && <Icon className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Categories Section */}
      <Container size="xl" className="py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)]">
            Explore our wide range of products
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category, index) => {
            const Icon = Icons[category.icon as keyof typeof Icons];
            return (
              <Card
                key={index}
                variant="elevated"
                padding="none"
                className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all"
                onClick={() => router.push(category.link)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      {Icon && <Icon className="w-5 h-5" />}
                      <h3 className="text-xl font-bold">{category.name}</h3>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>

      {/* Bestsellers Section */}
      <div className="py-12 md:py-20 bg-[var(--muted)]/30">
        <Container size="xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bestselling Products
            </h2>
            <p className="text-lg text-[var(--foreground-secondary)]">
              Most popular items this month
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <Icons.Loader className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.priceMinor / 100}
                  image={
                    product.images?.[0] ||
                    "https://via.placeholder.com/400x400?text=No+Image"
                  }
                  images={product.images}
                  badge={
                    product.stock < 10 && product.stock > 0
                      ? "Low Stock"
                      : undefined
                  }
                  badgeVariant={
                    product.stock < 10 && product.stock > 0 ? "sale" : undefined
                  }
                  inStock={product.stock > 0}
                  stockCount={product.stock}
                  category={product.category}
                  isFavorite={favorites.includes(product._id)}
                  onQuickView={() => router.push(`/products/${product.slug}`)}
                  onFavoriteToggle={(id) => {
                    setFavorites((prev) =>
                      prev.includes(id)
                        ? prev.filter((f) => f !== id)
                        : [...prev, id]
                    );
                  }}
                  showQuickAdd={false}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/products")}
              icon={<Icons.ArrowRight className="w-5 h-5" />}
            >
              View All Products
            </Button>
          </div>
        </Container>
      </div>

      {/* Call to Action Section */}
      <Container size="xl" className="py-12 md:py-20">
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 md:px-16">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              ></div>
            </div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Community
              </h2>
              <p className="text-lg mb-8 text-white/90">
                Subscribe to our newsletter and get exclusive deals, new
                arrivals, and more!
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Button
                  variant="glass"
                  className="bg-white text-blue-600 hover:bg-white/90 border-0"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
