"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import { API_BASE_URL } from "@/lib/constants";

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "", // Display price in rupees/dollars
    currency: "INR",
    stock: "0",
    sku: "",
    images: [] as string[],
    category: "",
    status: "draft" as "draft" | "active" | "archived",
    attributes: {} as Record<string, string>,
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Get signed URL
      const signedUrlResponse = await fetch(
        `${API_BASE_URL}/v1/admin/uploads/signed-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        }
      );

      if (!signedUrlResponse.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { signedUrl, publicUrl } = await signedUrlResponse.json();

      // Step 2: Upload file to signed URL (mock for now - in production this would be S3)
      // For development, we just use the publicUrl

      setFormData({
        ...formData,
        images: [...formData.images, publicUrl],
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert price from display format (rupees/dollars) to priceMinor (paise/cents)
      const priceMinor = Math.round(parseFloat(formData.price) * 100);

      const response = await fetch(`${API_BASE_URL}/v1/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          priceMinor,
          currency: formData.currency,
          stock: parseInt(formData.stock),
          sku: formData.sku || undefined,
          images: formData.images,
          category: formData.category || undefined,
          attributes:
            Object.keys(formData.attributes).length > 0
              ? formData.attributes
              : undefined,
          status: formData.status,
        }),
      });

      if (response.ok) {
        router.push("/admin/products");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Premium Cotton T-Shirt"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <Input
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="premium-cotton-t-shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Soft and comfortable cotton t-shirt..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (₹ / $) *
              </label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="199.00"
              />
            </div>

            <div>
              <Select
                label="Currency *"
                required
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                options={[
                  { value: "INR", label: "INR (₹)" },
                  { value: "USD", label: "USD ($)" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <Input
                required
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="TSH-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Input
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Clothing"
            />
          </div>

          <div>
            <Select
              label="Status *"
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="w-32 h-32 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          images: formData.images.filter((_, i) => i !== index),
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500">Uploading...</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
