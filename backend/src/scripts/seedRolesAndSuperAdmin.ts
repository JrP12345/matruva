// src/scripts/seedRolesAndSuperAdmin.ts
import mongoose from "mongoose";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { hashPassword } from "../helpers/authHelpers.js";

const PERMISSIONS = [
  // products
  "product:create",
  "product:read",
  "product:update",
  "product:delete",
  // orders
  "order:view",
  "order:update",
  "order:fulfill",
  "order:refund",
  // users
  "user:view",
  "user:update",
  "user:delete",
  // admin
  "admin:create",
  "admin:update",
  "admin:delete",
  "admin:list",
  // coupons/marketing
  "coupon:create",
  "coupon:update",
  "coupon:delete",
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
      "product:create",
      "product:read",
      "product:update",
      "product:delete",
      "order:view",
      "order:update",
      "order:fulfill",
      "order:refund",
      "user:view",
      "user:update",
      "coupon:create",
      "coupon:update",
      "coupon:delete",
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
      "product:create",
      "product:read",
      "product:update",
      "product:delete",
      "order:view",
      "order:update",
      "analytics:view",
    ],
    protected: true,
  },
  {
    name: "ORDER_MANAGER",
    label: "Order Manager",
    description: "Manages and fulfills orders",
    permissions: ["order:view", "order:update", "order:fulfill"],
    protected: true,
  },
  {
    name: "SUPPORT",
    label: "Support",
    description: "Customer support access",
    permissions: ["order:view", "user:view", "user:update", "analytics:view"],
    protected: true,
  },
  {
    name: "FINANCE",
    label: "Finance",
    description: "Financial operations access",
    permissions: ["finance:view", "order:view", "order:refund"],
    protected: true,
  },
  {
    name: "MARKETING",
    label: "Marketing",
    description: "Marketing and promotions access",
    permissions: [
      "coupon:create",
      "coupon:update",
      "coupon:delete",
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
