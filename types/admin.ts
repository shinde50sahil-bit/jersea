import { ProductSize } from "@/types/product";
import { Order } from "@/types/store";

export interface AdminStats {
  users: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface AdminLowStockProduct {
  id: string;
  name: string;
  stock: number;
  category: string;
}

export interface AdminDashboardPayload {
  stats: AdminStats;
  lowStockProducts: AdminLowStockProduct[];
}

export interface AdminProductPayload {
  name: string;
  shortDescription: string;
  description?: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  gallery: string[];
  sizes: ProductSize[];
  stock: number;
  sku?: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface AdminOrder extends Order {
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
}
