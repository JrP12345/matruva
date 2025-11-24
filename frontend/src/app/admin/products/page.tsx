"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  DataTable,
  Badge,
  Pagination,
  Container,
  LoadingOverlay,
} from "@/components/ui";
import Select from "@/components/ui/Select";
import { API_BASE_URL } from "@/lib/constants";

interface Product {
  _id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  stock: number;
  category?: string;
  status: "draft" | "active" | "archived";
  images: string[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const formatPrice = (priceMinor: number, currency: string) => {
    const amount = priceMinor / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (category) params.append("category", category);

      const response = await fetch(`${API_BASE_URL}/v1/products?${params}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, status, category]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "draft":
        return "gray";
      case "archived":
        return "red";
      default:
        return "gray";
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      cell: (product: Product) => (
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (product: Product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-gray-500">{product.slug}</div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (product: Product) => (
        <span className="font-medium">
          {formatPrice(product.priceMinor, product.currency)}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      cell: (product: Product) => (
        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
          {product.stock}
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (product: Product) => product.category || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (product: Product) => (
        <Badge color={getStatusColor(product.status)}>{product.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (product: Product) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${product._id}/edit`}>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(product._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Product Management</h1>
          <p className="text-[var(--foreground-secondary)]">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/create">
          <Button variant="primary">+ Create Product</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1"
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ]}
            className="w-48"
          />
          <Input
            placeholder="Category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-48"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingOverlay text="Loading products..." />
      ) : (
        <>
          <DataTable data={products} columns={columns} />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </Container>
  );
}
