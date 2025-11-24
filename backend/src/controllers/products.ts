// src/controllers/products.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Product from "../models/Product.js";
import { logAdminAction } from "../helpers/auditLog.js";

/**
 * GET /v1/products
 * Public endpoint - List products with pagination, filters, search, and sort
 */
export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const {
      page = "1",
      limit = "20",
      search,
      category,
      status = "active", // Only show active products to public by default
      minPrice,
      maxPrice,
      inStock,
      sort = "-createdAt", // Default: newest first
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Status filter (public sees only active, admins can see all)
    if (req.userId) {
      // Authenticated user - can filter by status
      if (status) {
        filter.status = status;
      }
    } else {
      // Public user - only active products
      filter.status = "active";
    }

    // Search by name or description
    if (search && typeof search === "string") {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.priceMinor = {};
      if (minPrice) {
        filter.priceMinor.$gte = parseInt(minPrice as string, 10);
      }
      if (maxPrice) {
        filter.priceMinor.$lte = parseInt(maxPrice as string, 10);
      }
    }

    // In stock filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    // Parse sort
    const sortField: Record<string, 1 | -1> = (sort as string).startsWith("-")
      ? { [(sort as string).slice(1)]: -1 }
      : { [sort as string]: 1 };

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortField as any)
        .skip(skip)
        .limit(limitNum)
        .select("-__v")
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

/**
 * GET /v1/products/:id
 * Public endpoint - Get single product details
 */
export async function getProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select("-__v").lean();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Public users can only see active products
    if (!req.userId && product.status !== "active") {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ product });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
}

/**
 * POST /v1/admin/products
 * Admin endpoint - Create new product
 * Requires: products.create permission
 */
export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const {
      name,
      slug,
      description,
      priceMinor,
      currency = "INR",
      stock = 0,
      sku,
      images = [],
      category,
      attributes,
      status = "draft",
    } = req.body;

    // Validation
    if (!name || !slug || priceMinor === undefined) {
      return res.status(400).json({
        error: "Missing required fields: name, slug, priceMinor",
      });
    }

    // Validate priceMinor
    if (typeof priceMinor !== "number" || priceMinor < 0) {
      return res.status(400).json({
        error: "priceMinor must be a non-negative number",
      });
    }

    // Validate stock
    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        error: "stock must be a non-negative number",
      });
    }

    // Validate currency
    if (!["INR", "USD"].includes(currency)) {
      return res.status(400).json({
        error: "currency must be INR or USD",
      });
    }

    // Validate status
    if (!["draft", "active", "archived"].includes(status)) {
      return res.status(400).json({
        error: "status must be draft, active, or archived",
      });
    }

    // Check slug uniqueness
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res
        .status(409)
        .json({ error: "Product with this slug already exists" });
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existingBySku = await Product.findOne({ sku });
      if (existingBySku) {
        return res
          .status(409)
          .json({ error: "Product with this SKU already exists" });
      }
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      priceMinor,
      currency,
      stock,
      sku,
      images,
      category,
      attributes,
      status,
      createdBy: req.userId, // From auth middleware
    });

    // Log admin action
    await logAdminAction(req, {
      actorId: req.userId!,
      action: "product.create",
      targetType: "Product",
      targetId: product._id,
      metadata: { name, slug, priceMinor, currency, status },
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        priceMinor: product.priceMinor,
        currency: product.currency,
        stock: product.stock,
        status: product.status,
      },
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
}

/**
 * PATCH /v1/admin/products/:id
 * Admin endpoint - Update product
 * Requires: products.update permission
 */
export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find existing product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Validate updates
    if (updates.priceMinor !== undefined) {
      if (typeof updates.priceMinor !== "number" || updates.priceMinor < 0) {
        return res.status(400).json({
          error: "priceMinor must be a non-negative number",
        });
      }
    }

    if (updates.stock !== undefined) {
      if (typeof updates.stock !== "number" || updates.stock < 0) {
        return res.status(400).json({
          error: "stock must be a non-negative number",
        });
      }
    }

    if (updates.currency && !["INR", "USD"].includes(updates.currency)) {
      return res.status(400).json({
        error: "currency must be INR or USD",
      });
    }

    if (
      updates.status &&
      !["draft", "active", "archived"].includes(updates.status)
    ) {
      return res.status(400).json({
        error: "status must be draft, active, or archived",
      });
    }

    // Check slug uniqueness if changing slug
    if (updates.slug && updates.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: updates.slug });
      if (existingProduct) {
        return res
          .status(409)
          .json({ error: "Product with this slug already exists" });
      }
    }

    // Check SKU uniqueness if changing SKU
    if (updates.sku && updates.sku !== product.sku) {
      const existingBySku = await Product.findOne({ sku: updates.sku });
      if (existingBySku) {
        return res
          .status(409)
          .json({ error: "Product with this SKU already exists" });
      }
    }

    // Prevent updating createdBy
    delete updates.createdBy;

    // Store old values for audit log
    const oldValues: any = {};
    for (const key of Object.keys(updates)) {
      if (key in product) {
        oldValues[key] = (product as any)[key];
      }
    }

    // Update product
    Object.assign(product, updates);
    await product.save();

    // Log admin action
    await logAdminAction(req, {
      actorId: req.userId!,
      action: "product.update",
      targetType: "Product",
      targetId: product._id,
      metadata: { updates, oldValues },
    });

    res.json({
      message: "Product updated successfully",
      product: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        priceMinor: product.priceMinor,
        currency: product.currency,
        stock: product.stock,
        status: product.status,
      },
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
}

/**
 * DELETE /v1/admin/products/:id
 * Admin endpoint - Delete product
 * Requires: products.delete permission
 */
export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Store product data for audit log
    const productData = {
      name: product.name,
      slug: product.slug,
      priceMinor: product.priceMinor,
      currency: product.currency,
    };

    // Delete product
    await Product.findByIdAndDelete(id);

    // Log admin action
    await logAdminAction(req, {
      actorId: req.userId!,
      action: "product.delete",
      targetType: "Product",
      targetId: id,
      metadata: productData,
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
