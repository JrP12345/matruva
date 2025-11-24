"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  Button,
  Card,
  Badge,
  Select,
  Input,
  TextArea,
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
  userEmail?: string;
  userName?: string;
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
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    permissions,
    loading: authLoading,
  } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Edit states
  const [editStatus, setEditStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If not authenticated after loading completes, redirect
    if (!isAuthenticated) {
      router.push("/login?redirect=/admin/orders");
      return;
    }

    // Check for admin permission (handle wildcard)
    const hasPermission =
      permissions.includes("*") || permissions.includes("orders:view");

    if (user && !hasPermission) {
      router.push("/");
      return;
    }

    // Authenticated with permissions and have orderId - fetch order
    if (orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, authLoading, user, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/v1/orders/${orderId}`);

      const data = response.data;
      setOrder(data.order);
      setEditStatus(data.order.status);
      setTrackingNumber(data.order.trackingNumber || "");
      setAdminNotes(data.order.notes || "");
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      // Prepare update payload
      const updates: any = {};

      if (editStatus !== order.status) {
        updates.status = editStatus;
      }

      if (trackingNumber !== (order.trackingNumber || "")) {
        updates.trackingNumber = trackingNumber;
      }

      if (adminNotes !== (order.notes || "")) {
        updates.notes = adminNotes;
      }

      if (Object.keys(updates).length > 0) {
        await api.patch(`/v1/orders/admin/${orderId}`, updates);
        alert("Order updated successfully");
        fetchOrder();
      } else {
        alert("No changes to update");
      }
    } catch (err: any) {
      console.error("Error updating order:", err);
      alert(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const handleRefundOrder = async () => {
    if (!order || !confirm("Are you sure you want to refund this order?")) {
      return;
    }

    try {
      await api.post(`/v1/orders/admin/${orderId}/refund`);
      alert("Order refunded successfully");
      fetchOrder();
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.response?.data?.message || "Failed to refund order");
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
    return (
      <Container>
        <div className="py-12 text-center">
          <Icons.Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </Container>
    );
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
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
              {order.updatedAt !== order.createdAt && (
                <p className="text-sm text-gray-500">
                  Last updated: {formatDate(order.updatedAt)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={getStatusColor(order.status)}
                className="text-lg px-4 py-2"
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
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
                            {Object.entries(item.attributes).map(
                              ([key, value]) => (
                                <span key={key} className="mr-3">
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      <p className="text-gray-600 mt-1">
                        {formatPrice(item.priceMinor, order.currency)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatPrice(
                          item.priceMinor * item.qty,
                          order.currency
                        )}
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
                    <span>
                      {formatPrice(order.taxMinor || 0, order.currency)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-4">
                  <span>Total</span>
                  <span>{formatPrice(order.totalMinor, order.currency)}</span>
                </div>
              </div>
            </Card>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{order.userName || "Guest"}</p>
                  </div>
                  {order.userEmail && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{order.userEmail}</p>
                    </div>
                  )}
                  {order.userId && (
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-mono text-sm">{order.userId}</p>
                    </div>
                  )}
                </div>
              </Card>

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
            </div>

            {/* Payment Info */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Payment Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      order.payment.status === "succeeded"
                        ? "success"
                        : "warning"
                    }
                  >
                    {order.payment.status.toUpperCase()}
                  </Badge>
                </div>
                {order.payment.paidAt && (
                  <div>
                    <p className="text-sm text-gray-600">Paid At</p>
                    <p className="font-medium text-sm">
                      {formatDate(order.payment.paidAt)}
                    </p>
                  </div>
                )}
                {order.payment.providerPaymentId && (
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-xs break-all">
                      {order.payment.providerPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Admin Actions */}
          <div className="space-y-6">
            {/* Update Order Status */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Update Order</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Order Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tracking Number
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Admin Notes
                  </label>
                  <TextArea
                    placeholder="Internal notes about this order"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handleUpdateOrder}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? (
                    <>
                      <Icons.Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icons.Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {order.status === "paid" && (
                  <Button
                    variant="primary"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setEditStatus("fulfilled");
                      setTimeout(handleUpdateOrder, 100);
                    }}
                  >
                    <Icons.CheckCircle className="w-5 h-5 mr-2" />
                    Mark as Fulfilled
                  </Button>
                )}

                {(order.status === "pending" || order.status === "paid") && (
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => {
                      if (confirm("Cancel this order?")) {
                        setEditStatus("cancelled");
                        setTimeout(handleUpdateOrder, 100);
                      }
                    }}
                  >
                    <Icons.XCircle className="w-5 h-5 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {order.payment.status === "succeeded" &&
                  order.status !== "refunded" && (
                    <Button
                      variant="secondary"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={handleRefundOrder}
                    >
                      <Icons.RefreshCw className="w-5 h-5 mr-2" />
                      Process Refund
                    </Button>
                  )}
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icons.Package className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.payment.paidAt && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Icons.CreditCard className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Payment Received</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.payment.paidAt)}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "fulfilled" && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Icons.CheckCircle className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Order Fulfilled</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}
