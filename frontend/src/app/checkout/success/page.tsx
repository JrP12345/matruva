"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Button,
  Card,
  Badge,
  LoadingOverlay,
} from "@/components/ui";
import { Icons } from "@/lib/icons";
import Link from "next/link";
import api from "@/lib/api";

interface Order {
  _id: string;
  items: Array<{
    productId: string;
    name: string;
    priceMinor: number;
    qty: number;
    attributes?: Record<string, string>;
  }>;
  status: string;
  totalMinor: number;
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  currency: string;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  payment: {
    provider: string;
    status: string;
    paidAt?: string;
  };
  stripeSessionId?: string;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/v1/orders/${orderId}`);
      const data = response.data;
      setOrder(data.order);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || "Failed to load order details");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingOverlay text="Loading your order..." />;
  }

  if (error || !order) {
    return (
      <Container>
        <div className="py-12 text-center">
          <Icons.XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "Unable to load order details"}
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order Info */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-mono font-semibold">
                #{order._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge variant={order.status === "paid" ? "success" : "warning"}>
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.qty}
                    </p>
                    {item.attributes &&
                      Object.keys(item.attributes).length > 0 && (
                        <p className="text-sm text-gray-500">
                          {Object.entries(item.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </p>
                      )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.priceMinor * item.qty, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t mt-6 pt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>
                  {formatPrice(order.subtotalMinor || 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {formatPrice(order.shippingMinor || 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatPrice(order.taxMinor || 0, order.currency)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-4">
              <span>Total</span>
              <span>{formatPrice(order.totalMinor, order.currency)}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Payment Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium capitalize">
                {order.payment.provider}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <Badge
                variant={
                  order.payment.status === "succeeded" ? "success" : "warning"
                }
              >
                {order.payment.status.toUpperCase()}
              </Badge>
            </div>
            {order.payment.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid At</span>
                <span>{formatDate(order.payment.paidAt)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account/orders" className="flex-1">
            <Button variant="primary" className="w-full">
              <Icons.Package className="w-5 h-5 mr-2" />
              View All Orders
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button variant="secondary" className="w-full">
              <Icons.ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-2">
            📧 Order confirmation sent to your email
          </p>
          <p>
            You will receive updates about your order status and shipping
            information.
          </p>
        </div>
      </div>
    </Container>
  );
}
