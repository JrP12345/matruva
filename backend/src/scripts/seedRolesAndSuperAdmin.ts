// src/scripts/seedRolesAndSuperAdmin.ts
import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { hashPassword } from "../helpers/authHelpers.js";

const PERMISSIONS = [
  // products
  "products:create",
  "products:read",
  "products:update",
  "products:delete",
  // orders
  "orders:view",
  "orders:update",
  "orders:fulfill",
  "orders:refund",
  // users
  "users:view",
  "users:update",
  "users:delete",
  // admin
  "admin:create",
  "admin:update",
  "admin:delete",
  "admin:list",
  // coupons/marketing
  "coupons:create",
  "coupons:update",
  "coupons:delete",
  // finance
  "finance:view",
  "finance:settle",
  // settings & analytics
  "settings:read",
  "settings:update",
  "analytics:view",
];

const ROLES = [
  {
    name: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full system access",
    permissions: ["*"],
    protected: true,
  },
  {
    name: "ADMIN",
    label: "Admin",
    description: "Administrative access",
    permissions: [
      "products:create",
      "products:read",
      "products:update",
      "products:delete",
      "orders:view",
      "orders:update",
      "orders:fulfill",
      "orders:refund",
      "users:view",
      "users:update",
      "coupons:create",
      "coupons:update",
      "coupons:delete",
      "analytics:view",
      "settings:read",
    ],
    protected: true,
  },
  {
    name: "STORE_MANAGER",
    label: "Store Manager",
    description: "Manages store products and orders",
    permissions: [
      "products:create",
      "products:read",
      "products:update",
      "products:delete",
      "orders:view",
      "orders:update",
      "analytics:view",
    ],
    protected: true,
  },
  {
    name: "ORDER_MANAGER",
    label: "Order Manager",
    description: "Manages and fulfills orders",
    permissions: ["orders:view", "orders:update", "orders:fulfill"],
    protected: true,
  },
  {
    name: "SUPPORT",
    label: "Support",
    description: "Customer support access",
    permissions: [
      "orders:view",
      "users:view",
      "users:update",
      "analytics:view",
    ],
    protected: true,
  },
  {
    name: "FINANCE",
    label: "Finance",
    description: "Financial operations access",
    permissions: ["finance:view", "orders:view", "orders:refund"],
    protected: true,
  },
  {
    name: "MARKETING",
    label: "Marketing",
    description: "Marketing and promotions access",
    permissions: [
      "coupons:create",
      "coupons:update",
      "coupons:delete",
      "analytics:view",
    ],
    protected: true,
  },
  {
    name: "USER",
    label: "Customer",
    description: "Regular customer",
    permissions: [],
    protected: true,
  },
];

async function main() {
  if (!process.env.DATABASE_URI) throw new Error("DATABASE_URI required");
  await mongoose.connect(process.env.DATABASE_URI);

  // seed permissions
  for (const key of PERMISSIONS) {
    await (Permission as any).updateOne(
      { key },
      { key, protected: true },
      { upsert: true }
    );
  }
  console.log("Permissions seeded");

  // seed roles
  for (const r of ROLES) {
    await (Role as any).updateOne(
      { name: r.name },
      {
        $set: {
          label: r.label,
          description: r.description || "",
          permissions: r.permissions,
          protected: !!r.protected,
        },
      },
      { upsert: true }
    );
  }
  console.log("Roles seeded");

  // create super admin if provided
  const adminEmail = process.env.SUPERADMIN_EMAIL;
  const adminPassword = process.env.SUPERADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const exists = await (User as any).findOne({ email: adminEmail });
    if (!exists) {
      const passwordHash = await hashPassword(adminPassword);
      const user = await (User as any).create({
        name: "Super Admin",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        refreshSessions: [],
      });
      console.log("Created SUPER_ADMIN", user._id.toString());
    } else {
      console.log("SUPER_ADMIN exists:", exists._id.toString());
    }
  } else {
    console.log(
      "SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD not provided; skip creating super admin."
    );
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
