"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  Button,
  Card,
  Badge,
  Pagination,
  LoadingOverlay,
} from "@/components/ui";
import { Icons } from "@/lib/icons";
import Link from "next/link";
import api from "@/lib/api";

interface Order {
  _id: string;
  items: Array<{
    name: string;
    qty: number;
    priceMinor: number;
  }>;
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If not authenticated after loading completes, redirect
    if (!isAuthenticated) {
      router.push("/login?redirect=/account/orders");
      return;
    }

    // Authenticated - fetch orders
    fetchOrders();
  }, [isAuthenticated, authLoading, currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = { page: currentPage, limit: 10 };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await api.get("/v1/orders", { params });
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      console.error("Error details:", err.response?.data);

      if (err.response?.status === 401) {
        setError("Please log in to view your orders");
        router.push("/login?redirect=/account/orders");
      } else {
        setError(err.response?.data?.message || "Failed to load orders");
      }
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
      month: "short",
      day: "numeric",
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

  if (authLoading) {
    return <LoadingOverlay text="Checking authentication..." />;
  }

  if (loading && orders.length === 0) {
    return <LoadingOverlay text="Loading your orders..." />;
  }

  if (error) {
    return (
      <Container>
        <Card className="max-w-2xl mx-auto mt-12">
          <div className="text-center py-12">
            <Icons.AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/login?redirect=/account/orders">
                <Button variant="primary">Log In</Button>
              </Link>
              <Button variant="secondary" onClick={() => fetchOrders()}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All Orders
            </Button>
            <Button
              variant={statusFilter === "pending" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "paid" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("paid")}
            >
              Paid
            </Button>
            <Button
              variant={statusFilter === "fulfilled" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("fulfilled")}
            >
              Fulfilled
            </Button>
            <Button
              variant={statusFilter === "cancelled" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Icons.Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              {statusFilter === "all"
                ? "You haven't placed any orders yet."
                : `No ${statusFilter} orders found.`}
            </p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold">
                      {formatPrice(order.totalMinor, order.currency)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.reduce((sum, item) => sum + item.qty, 0)}{" "}
                      items
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.name} × {item.qty}
                        </span>
                        <span className="font-medium">
                          {formatPrice(
                            item.priceMinor * item.qty,
                            order.currency
                          )}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/account/orders/${order._id}`}>
                    <Button variant="primary" size="sm">
                      <Icons.Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>

                  {order.status === "pending" && (
                    <Button
                      variant="secondary"
                      size="sm"
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
                      <Icons.CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Button>
                  )}

                  {(order.status === "pending" || order.status === "paid") && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        if (
                          confirm("Are you sure you want to cancel this order?")
                        ) {
                          try {
                            await api.patch(`/v1/orders/${order._id}/cancel`);
                            alert("Order cancelled successfully");
                            fetchOrders();
                          } catch (err: any) {
                            console.error("Error:", err);
                            alert(
                              err.response?.data?.message ||
                                "Failed to cancel order"
                            );
                          }
                        }
                      }}
                    >
                      <Icons.XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </Container>
  );
}
