"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Container, Badge, Card, Breadcrumb } from "@/components/ui";
import { useCart } from "../../../contexts/CartContext";
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
  attributes?: Record<string, string>;
  sku?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      // First get all products and find by slug
      const response = await fetch(
        `${API_BASE_URL}/v1/products?search=${slug}`
      );

      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.products.find(
          (p: Product) => p.slug === slug
        );

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          router.push("/products");
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceMinor: number, currency: string) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product._id,
      name: product.name,
      priceMinor: product.priceMinor,
      currency: product.currency,
      quantity,
      image: product.images[0],
    });

    alert("Product added to cart!");
  };

  if (loading) {
    return (
      <Container>
        <div className="py-12 text-center text-gray-500">Loading...</div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Container size="xl" className="py-8 md:py-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            ...(product.category ? [{ label: product.category }] : []),
            { label: product.name },
          ]}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <Card variant="elevated" className="overflow-hidden group">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative">
                {product.images.length > 0 ? (
                  <img
                    src={
                      product.images[selectedImage] ||
                      "https://via.placeholder.com/600x600?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/600x600?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-[var(--foreground-secondary)]">
                      No image available
                    </p>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Badge
                      variant="danger"
                      size="lg"
                      className="text-lg px-6 py-2"
                    >
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <img
                      src={image || "https://via.placeholder.com/100x100"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/100x100";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-4xl font-bold leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {product.category && (
                  <Badge variant="default" size="md">
                    {product.category}
                  </Badge>
                )}
                {product.stock > 0 ? (
                  <Badge variant="success" size="md">
                    ✓ In Stock ({product.stock} left)
                  </Badge>
                ) : (
                  <Badge variant="danger" size="md">
                    ✕ Out of Stock
                  </Badge>
                )}
              </div>

              {product.sku && (
                <p className="text-sm text-[var(--foreground-secondary)]">
                  SKU: <span className="font-mono">{product.sku}</span>
                </p>
              )}
            </div>

            <Card
              variant="glass"
              className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30"
            >
              <div className="p-6">
                <div className="text-sm text-[var(--foreground-secondary)] mb-2">
                  Price
                </div>
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.priceMinor, product.currency)}
                </div>
              </div>
            </Card>

            {product.description && (
              <Card variant="outlined">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <span>📝</span> Description
                  </h2>
                  <p className="text-[var(--foreground-secondary)] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </Card>
            )}

            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <Card variant="outlined">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <span>⚙️</span> Specifications
                    </h2>
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="border-b border-[var(--border)] pb-2"
                          >
                            <dt className="text-sm text-[var(--foreground-secondary)] capitalize mb-1">
                              {key}
                            </dt>
                            <dd className="font-semibold">{value}</dd>
                          </div>
                        )
                      )}
                    </dl>
                  </div>
                </Card>
              )}

            {product.stock > 0 && (
              <Card
                variant="elevated"
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12"
                      >
                        −
                      </Button>
                      <span className="text-2xl font-bold w-16 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() =>
                          setQuantity(Math.min(product.stock, quantity + 1))
                        }
                        className="w-12 h-12"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="primary"
                      size="lg"
                      fullWidth
                      className="text-lg font-semibold"
                    >
                      🛒 Add to Cart
                    </Button>
                    <Button
                      onClick={() => router.push("/products")}
                      variant="outline"
                      size="md"
                      fullWidth
                    >
                      ← Continue Shopping
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {product.stock === 0 && (
              <Card
                variant="elevated"
                className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
              >
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">😔</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Currently Unavailable
                  </h3>
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    This product is currently out of stock
                  </p>
                  <Button
                    onClick={() => router.push("/products")}
                    variant="outline"
                    size="md"
                    fullWidth
                  >
                    Browse Other Products
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
