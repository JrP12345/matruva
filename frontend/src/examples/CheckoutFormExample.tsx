// Example: Building a Checkout Form

"use client";

import { useState } from "react";
import {
  Container,
  Card,
  Input,
  TextArea,
  Select,
  Button,
  CartItem,
} from "@/components/ui";

export default function CheckoutFormExample() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  const cartItems = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 199.99,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
      variant: "Black",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 transition-colors duration-300">
      <Container size="lg">
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8 transition-colors duration-300">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 transition-colors duration-300">
                    Contact Information
                  </h2>
                  <Input
                    label="Email Address"
                    type="email"
                    variant="glass"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 transition-colors duration-300">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      variant="glass"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Last Name"
                      variant="glass"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <TextArea
                      label="Address"
                      variant="glass"
                      placeholder="123 Main St, Apt 4B"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <Input
                      label="City"
                      variant="glass"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    />
                    <Select
                      label="Country"
                      variant="glass"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      options={[
                        { value: "", label: "Select Country" },
                        { value: "us", label: "United States" },
                        { value: "ca", label: "Canada" },
                        { value: "uk", label: "United Kingdom" },
                      ]}
                      required
                    />
                    <Input
                      label="ZIP Code"
                      variant="glass"
                      placeholder="10001"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth>
                  Continue to Payment
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card variant="glass" padding="lg">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4 transition-colors duration-300">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <CartItem key={item.id} {...item} />
                ))}
              </div>

              <div className="space-y-2 border-t border-[var(--border)] pt-4 transition-colors duration-300">
                <div className="flex justify-between text-sm text-[var(--foreground-secondary)] transition-colors duration-300">
                  <span>Subtotal</span>
                  <span>$199.99</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--foreground-secondary)] transition-colors duration-300">
                  <span>Shipping</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--foreground-secondary)] transition-colors duration-300">
                  <span>Tax</span>
                  <span>$20.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[var(--foreground)] border-t border-[var(--border)] pt-2 transition-colors duration-300">
                  <span>Total</span>
                  <span>$229.99</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
