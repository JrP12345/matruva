"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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

interface OrderItem {
  productId: string;
  name: string;
  priceMinor: number;
  qty: number;
  attributes?: Record<string, string>;
}

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

interface PaymentInfo {
  provider: string;
  providerPaymentId?: string;
  status: string;
  paidAt?: string;
}

interface Order {
  _id: string;
  userId?: string;
  items: OrderItem[];
  status: string;
  totalMinor: number;
  subtotalMinor?: number;
  shippingMinor?: number;
  taxMinor?: number;
  currency: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  payment: PaymentInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/account/orders/${orderId}`);
      return;
    }

    if (isAuthenticated && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, authLoading, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/orders/${orderId}`);
      setOrder(response.data.order);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      await api.patch(`/v1/orders/${orderId}/cancel`);
      alert("Order cancelled successfully");
      fetchOrder();
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "fulfilled":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
      case "refunded":
        return "danger";
      default:
        return "default";
    }
  };

  if (loading || authLoading) {
    return <LoadingOverlay text="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <Container>
        <div className="py-12 text-center">
          <Icons.XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "Unable to load order"}
          </p>
          <Link href="/account/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account/orders"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <Badge
                variant={getStatusColor(order.status)}
                className="text-lg px-4 py-2"
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-gray-600">Quantity: {item.qty}</p>
                  {item.attributes &&
                    Object.keys(item.attributes).length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  <p className="text-gray-600 mt-1">
                    {formatPrice(item.priceMinor, order.currency)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatPrice(item.priceMinor * item.qty, order.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t mt-6 pt-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>
                  {formatPrice(order.subtotalMinor || 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {formatPrice(order.shippingMinor || 0, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
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

        {/* Shipping & Billing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
            <div className="text-gray-700 space-y-1">
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
              <p className="mt-2">
                <Icons.Phone className="w-4 h-4 inline mr-1" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium capitalize">
                  {order.payment.provider}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge
                  variant={
                    order.payment.status === "succeeded" ? "success" : "warning"
                  }
                >
                  {order.payment.status.toUpperCase()}
                </Badge>
              </div>
              {order.payment.paidAt && (
                <div>
                  <p className="text-sm text-gray-600">Paid At</p>
                  <p className="font-medium">
                    {formatDate(order.payment.paidAt)}
                  </p>
                </div>
              )}
              {order.payment.providerPaymentId && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm">
                    {order.payment.providerPaymentId}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold mb-2">Order Notes</h2>
            <p className="text-gray-700">{order.notes}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {(order.status === "pending" || order.status === "paid") && (
            <Button variant="danger" onClick={handleCancelOrder}>
              <Icons.XCircle className="w-5 h-5 mr-2" />
              Cancel Order
            </Button>
          )}

          {order.status === "pending" && (
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  const response = await api.post(
                    "/v1/payments/create-checkout-session",
                    {
                      orderId: order._id,
                    }
                  );
                  const { sessionUrl } = response.data;
                  window.location.href = sessionUrl;
                } catch (err: any) {
                  console.error("Error:", err);
                  alert(
                    err.response?.data?.message ||
                      "Failed to create checkout session"
                  );
                }
              }}
            >
              <Icons.CreditCard className="w-5 h-5 mr-2" />
              Complete Payment
            </Button>
          )}

          <Link href="/products">
            <Button variant="secondary">
              <Icons.ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
