import { ProductSize } from "@/types/product";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: "customer" | "admin";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  size: ProductSize;
  lineTotal: number;
  product: CartProduct;
}

export interface CartState {
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: number;
  };
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  subtotal: string | number;
  shippingFee: string | number;
  totalAmount: string | number;
  notes?: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  createdAt: string;
}
