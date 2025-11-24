/**
 * Admin Dashboard Page
 * Shows system stats and recent admin actions
 * Uses only reusable UI components
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";
import api from "@/lib/api";
import { ADMIN_ENDPOINTS, USER_ROLES } from "@/lib/constants";

interface DashboardStats {
  usersCount: number;
  rolesCount: number;
  permissionsCount: number;
  ordersCount: number;
  productsCount?: number;
  lowStockCount?: number;
  recentAdminActions: Array<{
    _id: string;
    action: string;
    actorEmail: string;
    targetType?: string;
    targetId?: string;
    metadata?: any;
    timestamp: string;
  }>;
}

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, productsRes] = await Promise.all([
        api.get(ADMIN_ENDPOINTS.DASHBOARD),
        fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/v1/products?limit=1000`
        )
          .then((r) => r.json())
          .catch(() => ({ data: [] })),
      ]);

      const products = productsRes.data || [];
      const productsCount = products.length;
      const lowStockCount = products.filter(
        (p: any) => p.stock < 10 && p.stock > 0
      ).length;

      setStats({
        ...dashboardRes.data,
        productsCount,
        lowStockCount,
      });
    } catch (err: any) {
      console.error("Failed to fetch dashboard:", err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/login");
    }
  };

  // Prepare table data for recent actions
  const tableColumns = [
    { key: "action", header: "Action", sortable: true },
    { key: "actor", header: "Actor", sortable: true },
    { key: "target", header: "Target" },
    { key: "timestamp", header: "Time", sortable: true },
  ];

  const tableData =
    stats?.recentAdminActions?.map((action) => ({
      action: action.action,
      actor: action.actorEmail,
      target: action.targetType
        ? `${action.targetType}${
            action.targetId ? ` (${action.targetId.slice(0, 8)}...)` : ""
          }`
        : "-",
      timestamp: new Date(action.timestamp).toLocaleString(),
    })) || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center animate-fade-in">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-[15px] text-[var(--foreground-secondary)] font-light tracking-wide">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="min-h-screen flex items-center justify-center py-12 ">
        <Card variant="elevated" className="max-w-md animate-fade-in">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-[28px] font-semibold mb-2 tracking-tight">
              Error Loading Dashboard
            </h2>
            <p className="text-[15px] text-[var(--foreground-secondary)] mb-6 font-light tracking-wide">
              {error}
            </p>
            <Button onClick={fetchDashboard} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Welcome Section */}
      <Container size="xl" className="py-6 mt-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-[var(--text-secondary)]">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" size="lg">
              {user?.role}
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="md">
              Logout
            </Button>
          </div>
        </div>
      </Container>

      {/* Main Content */}
      <Container size="xl" className="pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" hover animated>
            <div className="text-center">
              <div className="text-4xl mb-2">👥</div>
              <h3 className="text-3xl font-bold text-blue-600">
                {stats?.usersCount || 0}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Total Users
              </p>
            </div>
          </Card>

          <Card
            variant="elevated"
            hover
            animated
            className="cursor-pointer"
            onClick={() => router.push("/admin/products")}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <h3 className="text-3xl font-bold text-purple-600">
                {stats?.productsCount || 0}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Products</p>
              {(stats?.lowStockCount || 0) > 0 && (
                <Badge variant="warning" size="sm" className="mt-2">
                  {stats?.lowStockCount} low stock
                </Badge>
              )}
            </div>
          </Card>

          <Card variant="elevated" hover animated>
            <div className="text-center">
              <div className="text-4xl mb-2">🎭</div>
              <h3 className="text-3xl font-bold text-green-600">
                {stats?.rolesCount || 0}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">Roles</p>
            </div>
          </Card>

          <Card variant="elevated" hover animated>
            <div className="text-center">
              <div className="text-4xl mb-2">🔑</div>
              <h3 className="text-3xl font-bold text-orange-600">
                {stats?.permissionsCount || 0}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm">
                Permissions
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Admin Actions */}
        <Card variant="elevated" animated padding="lg">
          <div className="mb-6">
            <h2 className="text-[24px] font-semibold mb-2 tracking-tight">
              Recent Admin Actions
            </h2>
            <p className="text-[15px] text-[var(--foreground-secondary)] font-light tracking-wide">
              Last 10 administrative activities
            </p>
          </div>

          {tableData.length > 0 ? (
            <Table
              columns={tableColumns}
              data={tableData}
              variant="striped"
              hoverable
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-[17px] text-[var(--foreground-secondary)] font-light tracking-wide">
                No admin actions yet
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="outlined" hover padding="lg" className="text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-semibold text-[20px] mb-2 tracking-tight">
              Manage Products
            </h3>
            <p className="text-[15px] text-[var(--foreground-secondary)] font-light mb-4 tracking-wide">
              Add, edit, and manage products
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => router.push("/admin/products")}
              className="font-medium"
            >
              View Products
            </Button>
          </Card>

          <Card variant="outlined" hover padding="lg" className="text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-semibold text-[20px] mb-2 tracking-tight">
              Manage Users
            </h3>
            <p className="text-[15px] text-[var(--foreground-secondary)] font-light mb-4 tracking-wide">
              View and manage user accounts
            </p>
            <Button
              variant="outline"
              size="md"
              fullWidth
              disabled
              className="font-medium"
            >
              Coming Soon
            </Button>
          </Card>

          <Card variant="outlined" hover padding="lg" className="text-center">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="font-semibold text-[20px] mb-2 tracking-tight">
              Manage Roles
            </h3>
            <p className="text-[15px] text-[var(--foreground-secondary)] font-light mb-4 tracking-wide">
              Configure roles and permissions
            </p>
            <Button
              variant="outline"
              size="md"
              fullWidth
              disabled
              className="font-medium"
            >
              Coming Soon
            </Button>
          </Card>

          <Card variant="outlined" hover padding="lg" className="text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="font-semibold text-[20px] mb-2 tracking-tight">
              Audit Logs
            </h3>
            <p className="text-[15px] text-[var(--foreground-secondary)] font-light mb-4 tracking-wide">
              View detailed activity logs
            </p>
            <Button
              variant="outline"
              size="md"
              fullWidth
              disabled
              className="font-medium"
            >
              Coming Soon
            </Button>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole={USER_ROLES.SUPER_ADMIN}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
