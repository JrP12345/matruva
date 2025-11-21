// Example: Building a Product Listing Page

"use client";

import { useState } from "react";
import {
  Container,
  SearchBar,
  Select,
  ProductCard,
  Button,
  Badge,
} from "@/components/ui";

export default function ProductListingExample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const products = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 199.99,
      originalPrice: 299.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      badge: "Best Seller",
      rating: 4.5,
      reviews: 128,
      inStock: true,
    },
    // Add more products...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <Container size="xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Shop All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our amazing collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3">
            <SearchBar
              placeholder="Search products..."
              variant="glass"
              onSearch={setSearchQuery}
            />
          </div>
          <Select
            variant="glass"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "featured", label: "Featured" },
              { value: "price-low", label: "Price: Low to High" },
              { value: "price-high", label: "Price: High to Low" },
              { value: "rating", label: "Highest Rated" },
            ]}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={(id) => console.log(`Added ${id} to cart`)}
              onQuickView={(id) => console.log(`Quick view ${id}`)}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
