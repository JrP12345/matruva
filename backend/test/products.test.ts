// test/products.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  seedBasicData,
  createSuperAdmin,
  createTestUser,
  extractCookie,
} from "./setup.js";
import Product from "../src/models/Product.js";

let superAdminToken: string;
let testProduct: any;

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await clearDatabase();
  await seedBasicData();
  await createSuperAdmin("superadmin@test.com", "SuperPass123!");

  const loginResponse = await request(app).post("/v1/auth/login").send({
    email: "superadmin@test.com",
    password: "SuperPass123!",
  });
  superAdminToken = extractCookie(loginResponse.headers, "access_token") || "";

  testProduct = undefined;
});

describe("Product Model Validation", () => {
  it("should validate required fields", async () => {
    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        // Missing name, slug, priceMinor
        description: "Test product",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("required fields");
  });

  it("should validate priceMinor is non-negative", async () => {
    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Test Product",
        slug: "test-product",
        priceMinor: -100, // Negative price
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("non-negative");
  });

  it("should validate stock is non-negative", async () => {
    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Test Product",
        slug: "test-product",
        priceMinor: 10000,
        stock: -5, // Negative stock
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("non-negative");
  });

  it("should validate currency is INR or USD", async () => {
    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Test Product",
        slug: "test-product",
        priceMinor: 10000,
        currency: "EUR", // Invalid currency
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("currency");
  });

  it("should validate slug uniqueness", async () => {
    // Create first product
    await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Product 1",
        slug: "duplicate-slug",
        priceMinor: 10000,
      });

    // Try to create second product with same slug
    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Product 2",
        slug: "duplicate-slug", // Duplicate
        priceMinor: 20000,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("slug");
  });
});

describe("Product CRUD - Admin Endpoints", () => {
  describe("POST /v1/admin/products - Create Product", () => {
    it("should create product with valid data", async () => {
      const productData = {
        name: "Premium Laptop",
        slug: "premium-laptop",
        description: "High-performance laptop for professionals",
        priceMinor: 8999900, // ₹89,999.00
        currency: "INR",
        stock: 50,
        sku: "LAPTOP-001",
        images: [
          "https://example.com/laptop1.jpg",
          "https://example.com/laptop2.jpg",
        ],
        category: "Electronics",
        attributes: {
          brand: "TechBrand",
          processor: "Intel i7",
          ram: "16GB",
          storage: "512GB SSD",
        },
        status: "active",
      };

      const res = await request(app)
        .post("/v1/admin/products")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Product created successfully");
      expect(res.body.product).toMatchObject({
        name: productData.name,
        slug: productData.slug,
        priceMinor: productData.priceMinor,
        currency: productData.currency,
        stock: productData.stock,
        status: productData.status,
      });
      expect(res.body.product.id).toBeDefined();

      testProduct = res.body.product;
    });

    it("should create product with minimal fields", async () => {
      const res = await request(app)
        .post("/v1/admin/products")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          name: "Simple Product",
          slug: "simple-product",
          priceMinor: 99900, // ₹999.00
        });

      expect(res.status).toBe(201);
      expect(res.body.product.status).toBe("draft"); // Default status
      expect(res.body.product.currency).toBe("INR"); // Default currency
    });

    it("should require authentication", async () => {
      const res = await request(app).post("/v1/admin/products").send({
        name: "Test",
        slug: "test",
        priceMinor: 1000,
      });

      expect(res.status).toBe(401);
    });

    it("should require products.create permission", async () => {
      // Create user without products.create permission
      await createTestUser("user@test.com", "UserPass123!", "USER");
      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "user@test.com",
        password: "UserPass123!",
      });
      const userToken =
        extractCookie(loginResponse.headers, "access_token") || "";

      const res = await request(app)
        .post("/v1/admin/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Test",
          slug: "test",
          priceMinor: 1000,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /v1/admin/products/:id - Update Product", () => {
    beforeEach(async () => {
      // Create a product to update
      const res = await request(app)
        .post("/v1/admin/products")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          name: "Original Product",
          slug: "original-product",
          priceMinor: 50000,
          stock: 10,
        });

      testProduct = res.body.product;
    });

    it("should update product fields", async () => {
      const updates = {
        name: "Updated Product",
        priceMinor: 75000,
        stock: 25,
        status: "active",
      };

      const res = await request(app)
        .patch(`/v1/admin/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product updated successfully");
      expect(res.body.product).toMatchObject(updates);
    });

    it("should update only specified fields", async () => {
      const res = await request(app)
        .patch(`/v1/admin/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ stock: 100 });

      expect(res.status).toBe(200);
      expect(res.body.product.stock).toBe(100);
      expect(res.body.product.name).toBe("Original Product"); // Unchanged
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .patch(`/v1/admin/products/${fakeId}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({ stock: 50 });

      expect(res.status).toBe(404);
    });

    it("should require products.update permission", async () => {
      await createTestUser("user@test.com", "UserPass123!", "USER");
      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "user@test.com",
        password: "UserPass123!",
      });
      const userToken =
        extractCookie(loginResponse.headers, "access_token") || "";

      const res = await request(app)
        .patch(`/v1/admin/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ stock: 50 });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /v1/admin/products/:id - Delete Product", () => {
    beforeEach(async () => {
      const res = await request(app)
        .post("/v1/admin/products")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          name: "Product to Delete",
          slug: "product-to-delete",
          priceMinor: 10000,
        });

      testProduct = res.body.product;
    });

    it("should delete product", async () => {
      const res = await request(app)
        .delete(`/v1/admin/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product deleted successfully");

      // Verify product is deleted
      const getRes = await request(app).get(`/v1/products/${testProduct.id}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .delete(`/v1/admin/products/${fakeId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(404);
    });

    it("should require products.delete permission", async () => {
      await createTestUser("user@test.com", "UserPass123!", "USER");
      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "user@test.com",
        password: "UserPass123!",
      });
      const userToken =
        extractCookie(loginResponse.headers, "access_token") || "";

      const res = await request(app)
        .delete(`/v1/admin/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});

describe("Product Public Endpoints", () => {
  beforeEach(async () => {
    // Create multiple products
    await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Active Product 1",
        slug: "active-product-1",
        priceMinor: 10000,
        status: "active",
        category: "Electronics",
        stock: 5,
      });

    await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Active Product 2",
        slug: "active-product-2",
        priceMinor: 20000,
        status: "active",
        category: "Clothing",
        stock: 0,
      });

    const res = await request(app)
      .post("/v1/admin/products")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        name: "Draft Product",
        slug: "draft-product",
        priceMinor: 30000,
        status: "draft",
      });

    testProduct = res.body.product;
  });

  describe("GET /v1/products - List Products", () => {
    it("should list active products (public)", async () => {
      const res = await request(app).get("/v1/products");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2); // Only active products
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      });
    });

    it("should support pagination", async () => {
      const res = await request(app).get("/v1/products?page=1&limit=1");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.pagination.pages).toBe(2);
    });

    it("should filter by category", async () => {
      const res = await request(app).get("/v1/products?category=Electronics");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].category).toBe("Electronics");
    });

    it("should filter by in stock", async () => {
      const res = await request(app).get("/v1/products?inStock=true");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].stock).toBeGreaterThan(0);
    });

    it("should filter by price range", async () => {
      const res = await request(app).get(
        "/v1/products?minPrice=15000&maxPrice=25000"
      );

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].priceMinor).toBe(20000);
    });

    it("should support sorting", async () => {
      const res = await request(app).get("/v1/products?sort=priceMinor");

      expect(res.status).toBe(200);
      expect(res.body.products[0].priceMinor).toBe(10000); // Lowest first
    });
  });

  describe("GET /v1/products/:id - Get Product", () => {
    it("should get product details (public - active product)", async () => {
      const listRes = await request(app).get("/v1/products");
      const productId = listRes.body.products[0]._id;

      const res = await request(app).get(`/v1/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.product).toBeDefined();
      expect(res.body.product._id).toBe(productId);
    });

    it("should not show draft products to public", async () => {
      const res = await request(app).get(`/v1/products/${testProduct.id}`);

      expect(res.status).toBe(404);
    });

    it("should show draft products to authenticated users", async () => {
      const res = await request(app)
        .get(`/v1/products/${testProduct.id}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.product.status).toBe("draft");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/v1/products/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });
});

describe("Image Upload - Signed URL", () => {
  it("should generate signed URL for image upload", async () => {
    const res = await request(app)
      .post("/v1/admin/uploads/signed-url")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        fileName: "product-image.jpg",
        fileType: "image/jpeg",
        fileSize: 1024000, // 1MB
      });

    expect(res.status).toBe(200);
    expect(res.body.signedUrl).toBeDefined();
    expect(res.body.publicUrl).toBeDefined();
    expect(res.body.expiresIn).toBe(300); // 5 minutes
    expect(res.body.uploadMethod).toBe("PUT");
  });

  it("should validate required fields", async () => {
    const res = await request(app)
      .post("/v1/admin/uploads/signed-url")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        fileName: "test.jpg",
        // Missing fileType
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("required fields");
  });

  it("should validate file type", async () => {
    const res = await request(app)
      .post("/v1/admin/uploads/signed-url")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        fileName: "document.pdf",
        fileType: "application/pdf", // Not an image
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid file type");
  });

  it("should validate file size", async () => {
    const res = await request(app)
      .post("/v1/admin/uploads/signed-url")
      .set("Authorization", `Bearer ${superAdminToken}`)
      .send({
        fileName: "huge-image.jpg",
        fileType: "image/jpeg",
        fileSize: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("exceeds maximum");
  });

  it("should require authentication", async () => {
    const res = await request(app).post("/v1/admin/uploads/signed-url").send({
      fileName: "test.jpg",
      fileType: "image/jpeg",
    });

    expect(res.status).toBe(401);
  });
});
