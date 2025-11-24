"use client";

import { useCart } from "@/contexts/CartContext";
import { Container, Button, Card } from "@/components/ui";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();
  const { totalMinor, currency } = getCartTotal();

  const formatPrice = (priceMinor: number, curr: string) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(amount);
  };

  if (cart.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            Add some products to get started!
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="secondary" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.productId} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-gray-600 mb-2">
                      {formatPrice(item.priceMinor, item.currency)}
                    </p>

                    {item.attributes &&
                      Object.keys(item.attributes).length > 0 && (
                        <div className="text-sm text-gray-500 mb-2">
                          {Object.entries(item.attributes).map(
                            ([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          −
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatPrice(
                        item.priceMinor * item.quantity,
                        item.currency
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <span>{formatPrice(totalMinor, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalMinor, currency)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Final price calculated at checkout
                </p>
              </div>

              <Link href="/checkout">
                <Button className="w-full mb-3" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="secondary" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
