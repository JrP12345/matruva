"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Container, Button, Card, Input, Select } from "@/components/ui";
import Link from "next/link";
import api from "@/lib/api";

interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { totalMinor, currency } = getCartTotal();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    phone: "",
  });

  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IN",
    phone: "",
  });

  const formatPrice = (priceMinor: number, curr: string) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(amount);
  };

  const handleShippingChange = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingChange = (field: keyof ShippingAddress, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!shippingAddress.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      setError("Address is required");
      return false;
    }
    if (!shippingAddress.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!shippingAddress.state.trim()) {
      setError("State is required");
      return false;
    }
    if (!shippingAddress.postalCode.trim()) {
      setError("Postal code is required");
      return false;
    }
    if (!shippingAddress.phone.trim()) {
      setError("Phone is required");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    setError("");

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const items = cart.map((item) => ({
        productId: item.productId,
        qty: item.quantity,
        attributes: item.attributes,
      }));

      const orderPayload = {
        items,
        shippingAddress,
        billingAddress: sameAsBilling ? shippingAddress : billingAddress,
        notes: "",
      };

      const orderResponse = await api.post("/v1/orders", orderPayload);
      const { order } = orderResponse.data;

      // Step 2: Create Razorpay order
      const sessionResponse = await api.post(
        "/v1/payments/create-checkout-session",
        {
          orderId: order._id,
        }
      );
      const paymentData = sessionResponse.data;

      // Step 3: Open Razorpay checkout
      const options = {
        key: paymentData.razorpayKeyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "MATRUVA",
        description: "Order Payment",
        order_id: paymentData.razorpayOrderId,
        prefill: {
          name: paymentData.customerName,
          email: paymentData.customerEmail,
          contact: paymentData.customerPhone,
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async function (response: any) {
          // Payment successful - verify signature
          try {
            await api.post("/v1/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            clearCart();
            window.location.href = `/checkout/success?order_id=${order._id}`;
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            // User closed the payment modal
            window.location.href = `/checkout/cancel?order_id=${order._id}`;
          },
        },
      };

      // Load Razorpay script and open checkout
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err: any) {
      console.error("Checkout error:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to process checkout";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            Add some products before checking out!
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
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Billing Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) => handleShippingChange("name", e.target.value)}
                  required
                  placeholder="John Doe"
                />

                <Input
                  label="Address Line 1"
                  value={shippingAddress.addressLine1}
                  onChange={(e) =>
                    handleShippingChange("addressLine1", e.target.value)
                  }
                  required
                  placeholder="123 Main St"
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2}
                  onChange={(e) =>
                    handleShippingChange("addressLine2", e.target.value)
                  }
                  placeholder="Apartment, suite, etc."
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleShippingChange("city", e.target.value)
                    }
                    required
                    placeholder="Mumbai"
                  />

                  <Input
                    label="State"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      handleShippingChange("state", e.target.value)
                    }
                    required
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      handleShippingChange("postalCode", e.target.value)
                    }
                    required
                    placeholder="400001"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Country *
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        handleShippingChange("country", e.target.value)
                      }
                      required
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    handleShippingChange("phone", e.target.value)
                  }
                  required
                  placeholder="+91 98765 43210"
                />
              </div>
            </Card>

            {/* Billing Address */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Billing Address</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Same as shipping</span>
                </label>
              </div>

              {!sameAsBilling && (
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    value={billingAddress.name}
                    onChange={(e) =>
                      handleBillingChange("name", e.target.value)
                    }
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={billingAddress.addressLine1}
                    onChange={(e) =>
                      handleBillingChange("addressLine1", e.target.value)
                    }
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={billingAddress.addressLine2}
                    onChange={(e) =>
                      handleBillingChange("addressLine2", e.target.value)
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) =>
                        handleBillingChange("city", e.target.value)
                      }
                      required
                    />

                    <Input
                      label="State"
                      value={billingAddress.state}
                      onChange={(e) =>
                        handleBillingChange("state", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Postal Code"
                      value={billingAddress.postalCode}
                      onChange={(e) =>
                        handleBillingChange("postalCode", e.target.value)
                      }
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Country *
                      </label>
                      <select
                        className="w-full px-4 py-2 border rounded-lg"
                        value={billingAddress.country}
                        onChange={(e) =>
                          handleBillingChange("country", e.target.value)
                        }
                        required
                      >
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Phone"
                    type="tel"
                    value={billingAddress.phone}
                    onChange={(e) =>
                      handleBillingChange("phone", e.target.value)
                    }
                    required
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium">
                        {formatPrice(
                          item.priceMinor * item.quantity,
                          item.currency
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(totalMinor, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated by server</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>Calculated by server</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalMinor, currency)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Final price will be calculated including shipping & tax
                </p>
              </div>

              <Button
                className="w-full mb-3"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>

              <Link href="/cart">
                <Button variant="secondary" className="w-full">
                  Back to Cart
                </Button>
              </Link>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>🔒 Secure checkout powered by Stripe</p>
                <p className="mt-1">Your payment information is encrypted</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
