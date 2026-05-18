"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import StoreHeader from "@/components/StoreHeader";
import FilterSidebar, { PriceRange } from "@/components/FilterSidebar";
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
    summary: { itemCount: 0, subtotal: 0 }
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category")?.trim().toLowerCase() || "all"
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 0 });

  /* ─── Load ALL products once (filtering is client-side) ─────── */
  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        setCatalogLoading(true);
        setCatalogError(null);
        const data = await apiRequest<{ data?: { products?: BackendProduct[] } }>(
          `/api/products?limit=1000`
        );
        if (!active) return;
        const normalized = (data.data?.products || []).map(normalizeProduct);
        setProducts(normalized);
        // Initialise price range to full extent on first load
        if (normalized.length > 0) {
          const hi = Math.ceil(
            Math.max(...normalized.map((p) => p.price)) / 500
          ) * 500;
          setPriceRange({ min: 0, max: hi });
        }
      } catch (loadError) {
        if (!active) return;
        setCatalogError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to connect to backend"
        );
      } finally {
        if (active) setCatalogLoading(false);
      }
    }
    loadProducts();
    return () => { active = false; };
  }, []); // load once — all filtering is client-side

  /* ─── Auth / session ────────────────────────────── */
  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) return;
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    async function loadSession() {
      try {
        const [meResponse, cartResponse] = await Promise.all([
          apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", { token }),
          apiRequest<{ data: CartState }>("/api/cart", { token })
        ]);
        setUser(meResponse.data.user);
        setCart(cartResponse.data);
        setStoreError(null);
      } catch (error) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setCart({ items: [], summary: { itemCount: 0, subtotal: 0 } });
        setStoreError(error instanceof Error ? error.message : "Session expired");
      }
    }
    loadSession();
  }, [token]);

  /* ─── Handlers ──────────────────────────────────── */
  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setCart({ items: [], summary: { itemCount: 0, subtotal: 0 } });
    setStoreMessage("Logged out successfully.");
  }

  function handleCategoryChange(category: ProductCategory | "All") {
    // Just update state — no page navigation, all filtering is client-side
    setSelectedCategory(category === "All" ? "all" : category);
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
        body: JSON.stringify({ productId, size, quantity: 1 })
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

  /* ─── Derived data ──────────────────────────────── */
  const categories = useMemo(() => ["Football", "NBA"], []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map((p) => p.price)) / 500) * 500;
  }, [products]);

  const effectivePriceRange: PriceRange = useMemo(
    () => (priceRange.max === 0 ? { min: 0, max: maxPrice } : priceRange),
    [priceRange, maxPrice]
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let filtered = products;

    // Category filter — case-insensitive comparison
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) => p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }

    // Size filter
    if (selectedSize !== "All") {
      filtered = filtered.filter((p) => p.sizes.includes(selectedSize));
    }

    // Price range filter
    filtered = filtered.filter(
      (p) =>
        p.price >= effectivePriceRange.min &&
        p.price <= effectivePriceRange.max
    );

    // Search filter
    if (normalizedQuery) {
      filtered = filtered.filter((p) => {
        const searchable = [
          p.name, p.category, p.shortDescription, p.description, p.sku
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(normalizedQuery);
      });
    }

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === "Price") return a.price - b.price;
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }, [products, searchQuery, selectedCategory, selectedSize, sortBy, effectivePriceRange]);

  /* ─── Render ────────────────────────────────────── */
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

          {/* Toast messages */}
          {storeMessage && (
            <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {storeMessage}
            </div>
          )}
          {storeError && (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              {storeError}
            </div>
          )}

          {/* ── Two-column layout: sidebar + grid ─── */}
          <div className="flex gap-6 items-start">
            {/* Filter sidebar — desktop */}
            <FilterSidebar
              categories={categories}
              selectedCategory={
                selectedCategory === "all" ? "All" : selectedCategory
              }
              onCategoryChange={handleCategoryChange}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              priceRange={effectivePriceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={maxPrice}
              productCount={visibleProducts.length}
            />

            {/* Product area */}
            <div className="flex-1 min-w-0">
              {/* Mobile filter row */}
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={
                    selectedCategory === "all" ? "All" : selectedCategory
                  }
                  onCategoryChange={handleCategoryChange}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  priceRange={effectivePriceRange}
                  onPriceRangeChange={setPriceRange}
                  maxPrice={maxPrice}
                  productCount={visibleProducts.length}
                />
                <p className="text-xs text-white/40">
                  {visibleProducts.length} results
                </p>
              </div>

              {catalogLoading && (
                <div className="rounded-2xl border border-white/10 bg-jersea-surface p-8 text-center text-jersea-muted">
                  Loading products from backend…
                </div>
              )}
              {catalogError && (
                <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  {catalogError}
                </div>
              )}
              {!catalogLoading && (
                <ProductGrid
                  key={`${selectedCategory}-${selectedSize}-${sortBy}`}
                  products={visibleProducts}
                  addingProductId={addingProductId}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
