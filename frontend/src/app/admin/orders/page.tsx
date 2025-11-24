"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Container,
  DataTable,
  Badge,
  Button,
  Select,
  Input,
  Card,
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
}

interface Order {
  _id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  items: OrderItem[];
  status: string;
  totalMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    permissions,
    loading: authLoading,
  } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

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

    // Authenticated with permissions - fetch orders
    fetchOrders();
  }, [
    isAuthenticated,
    authLoading,
    user,
    pagination.currentPage,
    statusFilter,
    searchQuery,
  ]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get("/v1/orders/admin/all", { params });

      const data = response.data;
      setOrders(data.orders || []);
      setPagination({
        currentPage: data.page || 1,
        totalPages: data.totalPages || 1,
        totalOrders: data.total || 0,
        limit: data.limit || 10,
      });
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/v1/orders/admin/${orderId}`, { status: newStatus });
      alert("Order status updated successfully");
      fetchOrders();
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status");
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

  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      cell: (order: Order) => (
        <span className="font-mono text-sm">
          #{order._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (order: Order) => (
        <div>
          <p className="font-medium">{order.userName || "Guest"}</p>
          {order.userEmail && (
            <p className="text-sm text-gray-600">{order.userEmail}</p>
          )}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (order: Order) => {
        const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
        return (
          <span>
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (order: Order) => (
        <Badge variant={getStatusColor(order.status)}>
          {order.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "total",
      header: "Total",
      cell: (order: Order) => (
        <span className="font-semibold">
          {formatPrice(order.totalMinor, order.currency)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (order: Order) => (
        <span className="text-sm">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (order: Order) => (
        <div className="flex gap-2">
          <Link href={`/admin/orders/${order._id}`}>
            <Button variant="secondary" size="sm">
              <Icons.Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link>
          {order.status !== "fulfilled" && order.status !== "cancelled" && (
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "fulfilled", label: "Fulfilled" },
                { value: "cancelled", label: "Cancelled" },
                { value: "refunded", label: "Refunded" },
              ]}
              className="text-sm"
            />
          )}
        </div>
      ),
    },
  ];

  if (authLoading) {
    return <LoadingOverlay text="Checking permissions..." />;
  }

  return (
    <Container>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-gray-600">
            Manage all customer orders and update their status
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by order ID or customer email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Icons.Search className="w-5 h-5" />
              </Button>
            </form>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "fulfilled", label: "Fulfilled" },
                { value: "cancelled", label: "Cancelled" },
                { value: "refunded", label: "Refunded" },
              ]}
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-gray-600 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold">{pagination.totalOrders}</p>
          </Card>
          <Card className="bg-blue-50">
            <p className="text-blue-600 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </Card>
          <Card className="bg-green-50">
            <p className="text-green-600 text-sm mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "paid").length}
            </p>
          </Card>
          <Card className="bg-purple-50">
            <p className="text-purple-600 text-sm mb-1">Fulfilled</p>
            <p className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.status === "fulfilled").length}
            </p>
          </Card>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <Icons.Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Icons.XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrders}>Retry</Button>
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <Icons.Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here when customers make purchases"}
            </p>
          </Card>
        ) : (
          <>
            <DataTable columns={columns} data={orders} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.max(1, prev.currentPage - 1),
                    }))
                  }
                  disabled={pagination.currentPage === 1}
                >
                  <Icons.ChevronLeft className="w-5 h-5" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.currentPage) <= 1
                    )
                    .map((page, index, array) => {
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;

                      return (
                        <div key={page}>
                          {showEllipsis && <span className="px-2">...</span>}
                          <Button
                            variant={
                              page === pagination.currentPage
                                ? "primary"
                                : "secondary"
                            }
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                currentPage: page,
                              }))
                            }
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>

                <Button
                  variant="secondary"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: Math.min(
                        prev.totalPages,
                        prev.currentPage + 1
                      ),
                    }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                  <Icons.ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
