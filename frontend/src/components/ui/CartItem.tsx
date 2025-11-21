"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  image,
  variant,
  onQuantityChange,
  onRemove,
  className,
}) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (onQuantityChange) {
      onQuantityChange(id, newQuantity);
    }
  };

  const total = price * quantity;

  return (
    <div
      className={cn(
        "flex gap-4 p-4 bg-[var(--card-background)] rounded-xl border border-[var(--border)] transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 bg-[var(--muted)] rounded-lg overflow-hidden transition-colors duration-300">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-grow">
        <h4 className="font-semibold text-[var(--foreground)] mb-1 transition-colors duration-300">
          {name}
        </h4>
        {variant && (
          <p className="text-sm text-[var(--foreground-secondary)] mb-2 transition-colors duration-300">
            {variant}
          </p>
        )}
        <div className="flex items-center gap-4">
          <span className="font-bold text-[var(--foreground)] transition-colors duration-300">
            ${price.toFixed(2)}
          </span>
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-all duration-300 active:scale-95"
            >
              <svg
                className="w-4 h-4 text-[var(--foreground-secondary)]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M20 12H4"></path>
              </svg>
            </button>
            <span className="w-8 text-center font-medium text-[var(--foreground)] transition-colors duration-300">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-all duration-300 active:scale-95"
            >
              <svg
                className="w-4 h-4 text-[var(--foreground-secondary)]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Total & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove && onRemove(id)}
          className="p-1 hover:bg-[var(--error-bg)] rounded-lg transition-all duration-300 group"
        >
          <svg
            className="w-5 h-5 text-[var(--error)] group-hover:scale-110 transition-transform duration-200"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
        <span className="font-bold text-lg text-[var(--foreground)] transition-colors duration-300">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
