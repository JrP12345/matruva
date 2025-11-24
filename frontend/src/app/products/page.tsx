"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Input,
  Pagination,
  Container,
  Button,
  Badge,
  Card,
} from "@/components/ui";
import Select from "@/components/ui/Select";
import ProductCard from "@/components/ui/ProductCard";
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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("created_desc");
  const [inStock, setInStock] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort,
      });

      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (inStock) params.append("inStock", "true");

      const response = await fetch(`${API_BASE_URL}/v1/products?${params}`);

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, category, sort, inStock]);

  const formatPrice = (priceMinor: number, currency: string) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <Container size="xl" className="relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in tracking-tight">
              Discover Our Products
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              Explore our curated collection of high-quality products at
              unbeatable prices
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">✓ Free Shipping</span>
              <span className="flex items-center gap-1">✓ Easy Returns</span>
              <span className="flex items-center gap-1">✓ Secure Payment</span>
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>🔍</span> Filters
                  </h3>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search
                  </label>
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Input
                    placeholder="e.g., Electronics"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                {/* Sort */}
                <div>
                  <Select
                    label="Sort By"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { value: "created_desc", label: "🆕 Newest First" },
                      { value: "price_asc", label: "💰 Price: Low to High" },
                      { value: "price_desc", label: "💸 Price: High to Low" },
                      { value: "name_asc", label: "🔤 Name: A to Z" },
                      { value: "name_desc", label: "🔤 Name: Z to A" },
                    ]}
                  />
                </div>

                {/* Stock Filter */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-[var(--muted)] p-3 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => {
                        setInStock(e.target.checked);
                        setPage(1);
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">
                      ✅ In Stock Only
                    </span>
                  </label>
                </div>

                {/* Clear Filters */}
                {(search || category || inStock || sort !== "created_desc") && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setSort("created_desc");
                      setInStock(false);
                      setPage(1);
                    }}
                  >
                    🔄 Clear All Filters
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">All Products</h2>
                {!loading && (
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                    Showing {products.length} product
                    {products.length !== 1 ? "s" : ""}
                    {totalPages > 1 && ` (Page ${page} of ${totalPages})`}
                  </p>
                )}
              </div>

              {/* Active Filters */}
              <div className="flex gap-2 flex-wrap">
                {search && (
                  <Badge
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => setSearch("")}
                  >
                    {search} ✕
                  </Badge>
                )}
                {category && (
                  <Badge
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => setCategory("")}
                  >
                    {category} ✕
                  </Badge>
                )}
                {inStock && (
                  <Badge
                    variant="success"
                    className="cursor-pointer"
                    onClick={() => setInStock(false)}
                  >
                    In Stock ✕
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-[var(--muted)]" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[var(--muted)] rounded w-3/4" />
                      <div className="h-4 bg-[var(--muted)] rounded w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card variant="elevated" className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  No Products Found
                </h3>
                <p className="text-[var(--foreground-secondary)] mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setInStock(false);
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => router.push(`/products/${product.slug}`)}
                      className="cursor-pointer"
                    >
                      <ProductCard
                        id={product._id}
                        name={product.name}
                        price={product.priceMinor / 100}
                        image={
                          product.images?.[0] ||
                          "https://via.placeholder.com/400x400?text=No+Image"
                        }
                        inStock={product.stock > 0}
                        stockCount={product.stock}
                        category={product.category}
                        badge={
                          product.stock < 10 && product.stock > 0
                            ? "Low Stock"
                            : undefined
                        }
                        badgeVariant="sale"
                        onQuickView={(id) =>
                          router.push(`/products/${product.slug}`)
                        }
                        showQuickAdd={false}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
