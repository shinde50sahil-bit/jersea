export type ProductCategory = string;
export type ProductSize =
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "3XL"
  | "4XL"
  | "16"
  | "18"
  | "20"
  | "22"
  | "24"
  | "26"
  | "28";
export type SortOption = "Newest" | "Price";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  gallery?: string[];
  shortDescription: string;
  description?: string;
  addedAt: string;
  sizes: ProductSize[];
  stock: number;
  sku?: string | null;
  isFeatured?: boolean;
}

export interface BackendProduct {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: string | number;
  compareAtPrice?: string | number | null;
  imageUrl: string;
  gallery?: string[];
  shortDescription: string;
  description: string;
  sku?: string | null;
  isFeatured?: boolean;
  createdAt: string;
  sizes: ProductSize[];
  stock: number;
}
