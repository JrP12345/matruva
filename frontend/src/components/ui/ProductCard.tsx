"use client";

import React, { memo, useState, useCallback } from "react";
import Card from "./Card";
import Button from "./Button";
import Badge from "./Badge";
import { cn } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Multiple images for hover
  badge?: string;
  badgeVariant?: "new" | "sale" | "hot" | "soldout";
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stockCount?: number;
  category?: string;
  isFavorite?: boolean;
  onAddToCart?: (id: string) => void;
  onQuickView?: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  className?: string;
  showQuickAdd?: boolean;
  loading?: boolean;
}

const ProductCard = memo<ProductCardProps>(function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  images = [],
  badge,
  badgeVariant = "sale",
  rating = 0,
  reviews = 0,
  inStock = true,
  stockCount,
  category,
  isFavorite = false,
  onAddToCart,
  onQuickView,
  onFavoriteToggle,
  className,
  showQuickAdd = true,
  loading = false,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const allImages = [image, ...images];

  const handleAddToCart = async () => {
    if (!inStock || isAdding) return;
    setIsAdding(true);
    await onAddToCart?.(id);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const badgeColors = {
    new: "bg-green-500",
    sale: "bg-red-500",
    hot: "bg-orange-500",
    soldout: "bg-gray-500",
  };

  if (loading) {
    return (
      <Card
        variant="default"
        padding="none"
        className={cn("animate-pulse", className)}
      >
        <div className="aspect-square bg-[var(--muted)] animate-shimmer" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-[var(--muted)] rounded-lg w-3/4" />
          <div className="h-4 bg-[var(--muted)] rounded-lg w-1/2" />
          <div className="h-3 bg-[var(--muted)] rounded-lg w-2/3" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="default"
      padding="none"
      hover
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] will-change-transform hover:shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[var(--muted)] rounded-t-2xl">
        <img
          src={allImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Image Navigation Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-400 z-10">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-400 ease-out",
                  idx === currentImageIndex
                    ? "bg-white w-6 shadow-lg"
                    : "bg-white/60 hover:bg-white/80 w-1 hover:w-3"
                )}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {badge && (
            <Badge
              variant={
                badgeVariant === "new"
                  ? "success"
                  : badgeVariant === "hot"
                  ? "warning"
                  : badgeVariant === "soldout"
                  ? "default"
                  : "danger"
              }
              size="sm"
              className="animate-slide-down"
            >
              {badge}
            </Badge>
          )}
          {discount > 0 && !badge && (
            <Badge variant="danger" size="sm" className="animate-slide-down">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Category Tag */}
        {category && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/50 backdrop-blur-lg rounded-full text-white text-[11px] font-semibold tracking-wide z-10">
            {category}
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2 z-10">
          {/* Quick View Button */}
          {onQuickView && (
            <Button
              variant="glass"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(id);
              }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Quick View
            </Button>
          )}

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <Button
              variant="glass"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(id);
              }}
              className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              style={{ transitionDelay: "50ms" }}
            >
              <svg
                className={cn(
                  "w-4 h-4",
                  isFavorite && "fill-red-500 text-red-500"
                )}
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Button>
          )}
        </div>

        {/* Stock Badge */}
        {stockCount !== undefined &&
          stockCount <= 10 &&
          stockCount > 0 &&
          inStock && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded animate-pulse z-10">
              Only {stockCount} left!
            </div>
          )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <svg
              className="w-12 h-12 text-white/80 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="text-white font-semibold text-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-[var(--foreground)] mb-2 line-clamp-2 min-h-[3rem] group-hover:text-[var(--primary)] transition-colors duration-300">
          {name}
        </h3>

        {/* Rating & Reviews */}
        {rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-4 h-4 transition-all duration-300",
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-yellow-400 scale-100"
                      : "text-[var(--border)] scale-90"
                  )}
                  fill={i < Math.floor(rating) ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-sm font-medium text-[var(--foreground-secondary)]">
              {rating.toFixed(1)}
            </span>
            {reviews > 0 && (
              <span className="text-xs text-[var(--foreground-tertiary)]">
                ({reviews} {reviews === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[var(--foreground)]">
            ${price.toFixed(2)}
          </span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="text-sm text-[var(--foreground-tertiary)] line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-[var(--success-foreground)] bg-[var(--success-bg)] px-2 py-0.5 rounded-full">
                Save ${(originalPrice - price).toFixed(2)}
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        {stockCount !== undefined &&
          stockCount > 0 &&
          stockCount <= 20 &&
          inStock && (
            <div className="flex items-center gap-1.5 text-xs">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  stockCount <= 5
                    ? "bg-[var(--error)] animate-pulse"
                    : stockCount <= 10
                    ? "bg-[var(--warning-bg)]"
                    : "bg-[var(--success-bg)]"
                )}
              />
              <span className="text-[var(--foreground-secondary)]">
                {stockCount <= 5
                  ? "Low stock"
                  : stockCount <= 10
                  ? "Limited stock"
                  : "In stock"}
              </span>
            </div>
          )}

        {/* Add to Cart Button */}
        {showQuickAdd && onAddToCart && (
          <Button
            variant={inStock ? "primary" : "outline"}
            size="sm"
            fullWidth
            disabled={!inStock || isAdding}
            onClick={handleAddToCart}
            className="transform transition-all duration-300 hover:scale-[1.02] will-change-transform active:scale-[0.98] will-change-transform"
          >
            {isAdding ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Adding...
              </>
            ) : inStock ? (
              <>
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Add to Cart
              </>
            ) : (
              "Out of Stock"
            )}
          </Button>
        )}
      </div>
    </Card>
  );
});

export default ProductCard;
