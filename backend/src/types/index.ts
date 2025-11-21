// src/types/index.ts
export type RoleName =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STORE_MANAGER"
  | "ORDER_MANAGER"
  | "SUPPORT"
  | "FINANCE"
  | "MARKETING"
  | "USER";

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: RoleName | string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDTO {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  priceMinor: number;
  currency: string;
  images: string[];
  stock: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  productId: string;
  title: string;
  priceMinor: number;
  qty: number;
}

export interface OrderDTO {
  _id: string;
  userId: string;
  items: OrderItemDTO[];
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}
