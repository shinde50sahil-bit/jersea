"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import FilterSidebar from "@/components/FilterSidebar";
import ProductGrid from "@/components/ProductGrid";
import StoreHeader from "@/components/StoreHeader";
import {
  BackendProduct,
  Product,
  ProductCategory,
  ProductSize,
  SortOption
} from "@/types/product";
import { AuthUser, CartState } from "@/types/store";
import {
  apiRequest,
  clearStoredToken,
  getStoredToken
} from "@/utils/api";
import { normalizeProduct } from "@/utils/products";

const easeFlow = [0.25, 0.1, 0.25, 1];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [storeMessage, setStoreMessage] = useState<string | null>(null);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartState>({
    items: [],
    summary: {
      itemCount: 0,
      subtotal: 0
    }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category")?.trim().toLowerCase() || "all"
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setCatalogLoading(true);
        setCatalogError(null);

        const categoryQuery =
          selectedCategory === "all"
            ? ""
            : `&category=${encodeURIComponent(selectedCategory)}`;
        const data = await apiRequest<{
          data?: { products?: BackendProduct[] };
        }>(`/api/products?limit=1000${categoryQuery}`);

        if (!active) return;

        setProducts((data.data?.products || []).map(normalizeProduct));
      } catch (loadError) {
        if (!active) return;

        setCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to connect to backend"
        );
      } finally {
        if (active) {
          setCatalogLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) return;

    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    async function loadSession() {
      try {
        const [meResponse, cartResponse, addressesResponse, ordersResponse] =
          await Promise.all([
            apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", { token }),
            apiRequest<{ data: CartState }>("/api/cart", { token }),
            Promise.resolve({ data: { addresses: [] } }),
            Promise.resolve({ data: { orders: [] } })
          ]);

        setUser(meResponse.data.user);
        setCart(cartResponse.data);
        void addressesResponse;
        void ordersResponse;
        setStoreError(null);
      } catch (error) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setCart({
          items: [],
          summary: { itemCount: 0, subtotal: 0 }
        });
        setStoreError(
          error instanceof Error ? error.message : "Session expired"
        );
      }
    }

    loadSession();
  }, [token]);

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setCart({
      items: [],
      summary: { itemCount: 0, subtotal: 0 }
    });
    setStoreMessage("Logged out successfully.");
  }

  function normalizeCategory(category: string) {
    return category.trim().toLowerCase();
  }

  function handleCategoryChange(category: ProductCategory | "All") {
    const nextCategory =
      category === "All" ? "all" : normalizeCategory(category);

    setSelectedCategory(nextCategory);

    if (typeof window !== "undefined") {
      const nextUrl =
        nextCategory === "all"
          ? "/"
          : `/?category=${encodeURIComponent(nextCategory)}`;

      window.location.assign(nextUrl);
    }
  }

  function handleSizeChange(size: ProductSize | "All") {
    setSelectedSize(size);
  }

  async function handleAddToCart(productId: string, size: ProductSize) {
    if (!token) {
      router.push("/login?redirect=/");
      return;
    }

    try {
      setAddingProductId(productId);
      setStoreError(null);
      setStoreMessage(null);

      const response = await apiRequest<{ data: CartState }>("/api/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          productId,
          size,
          quantity: 1
        })
      });

      setCart(response.data);
      setStoreMessage("Item added to cart.");
    } catch (error) {
      setStoreError(
        error instanceof Error ? error.message : "Could not add to cart"
      );
    } finally {
      setAddingProductId(null);
    }
  }

  const categories = useMemo(
    () => ["Football", "NBA"],
    []
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const sizeFilteredProducts =
      selectedSize === "All"
        ? products
        : products.filter((product) => product.sizes.includes(selectedSize));

    const searchFilteredProducts = normalizedQuery
      ? sizeFilteredProducts.filter((product) => {
          const searchableContent = [
            product.name,
            product.category,
            product.shortDescription,
            product.description,
            product.sku
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableContent.includes(normalizedQuery);
        })
      : sizeFilteredProducts;

    return [...searchFilteredProducts].sort((first, second) => {
      if (sortBy === "Price") {
        return first.price - second.price;
      }

      return (
        new Date(second.addedAt).getTime() - new Date(first.addedAt).getTime()
      );
    });
  }, [products, searchQuery, selectedSize, sortBy]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75, ease: easeFlow }}
      className="min-h-screen bg-jersea-bg text-white"
    >
      <Hero />

      <section id="marketplace" className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-16 h-20 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
        <div className="mx-auto max-w-[1560px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <StoreHeader
            customerName={user?.fullName}
            cartCount={cart.summary.itemCount}
            onLogout={handleLogout}
          />

          {storeMessage ? (
            <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {storeMessage}
            </div>
          ) : null}

          {storeError ? (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              {storeError}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-6 xl:grid-cols-[250px_1fr]">
            <FilterSidebar
              categories={categories}
              selectedCategory={
                selectedCategory === "all"
                  ? "All"
                  : categories.find(
                      (category) => normalizeCategory(category) === selectedCategory
                    ) || "All"
              }
              onCategoryChange={handleCategoryChange}
              selectedSize={selectedSize}
              onSizeChange={handleSizeChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
            <div>
              {catalogLoading ? (
                <div className="rounded-2xl border border-white/10 bg-jersea-surface p-8 text-center text-jersea-muted">
                  Loading products from backend...
                </div>
              ) : null}

              {catalogError ? (
                <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {catalogError}
                </div>
              ) : null}

              {!catalogLoading ? (
                <ProductGrid
                  key={`${selectedCategory}-${selectedSize}-${sortBy}`}
                  products={visibleProducts}
                  addingProductId={addingProductId}
                  onAddToCart={handleAddToCart}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
