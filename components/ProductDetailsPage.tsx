"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StoreHeader from "@/components/StoreHeader";
import { BackendProduct, Product, ProductSize } from "@/types/product";
import { AuthUser, CartState } from "@/types/store";
import {
  apiRequest,
  clearStoredToken,
  getStoredToken
} from "@/utils/api";
import { resolveImageUrl } from "@/utils/images";
import { normalizeProduct } from "@/utils/products";

type ProductDetailsPageProps = {
  slug: string;
};

function formatPrice(value: string | number | null | undefined) {
  return Number(value || 0).toLocaleString("en-IN");
}

function getDiscountPercent(product: BackendProduct) {
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const currentPrice = Number(product.price || 0);

  if (!compareAtPrice || compareAtPrice <= currentPrice) {
    return null;
  }

  return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
}

function buildGallery(product: BackendProduct | null) {
  if (!product) {
    return [];
  }

  return Array.from(
    new Set([product.imageUrl, ...(product.gallery || [])].filter(Boolean))
  );
}

export default function ProductDetailsPage({
  slug
}: ProductDetailsPageProps) {
  const router = useRouter();
  const productKey = slug || "";
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartState>({
    items: [],
    summary: {
      itemCount: 0,
      subtotal: 0
    }
  });
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [storeMessage, setStoreMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setPageLoading(true);
        setPageError(null);

        const response = await apiRequest<{ data: { product: BackendProduct } }>(
          `/api/products/${encodeURIComponent(productKey)}`
        );

        if (!active) {
          return;
        }

        const nextProduct = response.data.product;
        const nextGallery = buildGallery(nextProduct);

        setProduct(nextProduct);
        setSelectedSize(nextProduct.sizes[0] || null);
        setSelectedImage(nextGallery[0] || "");
      } catch (error) {
        if (!active) {
          return;
        }

        setPageError(
          error instanceof Error
            ? error.message
            : "Unable to load this product right now."
        );
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [productKey]);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setCart({
        items: [],
        summary: { itemCount: 0, subtotal: 0 }
      });
      return;
    }

    let active = true;

    async function loadSession() {
      try {
        setStoreLoading(true);

        const [meResponse, cartResponse] = await Promise.all([
          apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", { token }),
          apiRequest<{ data: CartState }>("/api/cart", { token })
        ]);

        if (!active) {
          return;
        }

        setUser(meResponse.data.user);
        setCart(cartResponse.data);
        setStoreError(null);
      } catch (error) {
        if (!active) {
          return;
        }

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
      } finally {
        if (active) {
          setStoreLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const currentProduct = product;
    let active = true;

    async function loadRelatedProducts() {
      try {
        const response = await apiRequest<{
          data?: { products?: BackendProduct[] };
        }>(
          `/api/products?category=${encodeURIComponent(currentProduct.category)}`
        );

        if (!active) {
          return;
        }

        setRelatedProducts(
          (response.data?.products || [])
            .filter((item) => item.id !== currentProduct.id)
            .slice(0, 4)
            .map(normalizeProduct)
        );
      } catch (error) {
        void error;
      }
    }

    loadRelatedProducts();

    return () => {
      active = false;
    };
  }, [product]);

  async function handleAddToCart() {
    if (!product || !selectedSize) {
      setStoreError("Please choose a size before adding this item.");
      return;
    }

    if (!token) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    try {
      setAddingToCart(true);
      setStoreError(null);
      setStoreMessage(null);

      const response = await apiRequest<{ data: CartState }>("/api/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity: 1
        })
      });

      setCart(response.data);
      setStoreMessage("Item added to cart.");
    } catch (error) {
      setStoreError(
        error instanceof Error ? error.message : "Could not add item to cart"
      );
    } finally {
      setAddingToCart(false);
    }
  }

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

  const galleryImages = useMemo(() => buildGallery(product), [product]);
  const discountPercent = product ? getDiscountPercent(product) : null;
  const selectedImageUrl = resolveImageUrl(
    selectedImage || galleryImages[0] || ""
  );

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-jersea-bg px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-jersea-surface/80 p-10 text-center text-jersea-muted">
            Loading product details...
          </div>
        </div>
      </main>
    );
  }

  if (!product || pageError) {
    return (
      <main className="min-h-screen bg-jersea-bg px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
            <h1 className="text-3xl font-semibold text-white">
              Product not available
            </h1>
            <p className="mt-3 text-sm text-amber-100">
              {pageError || "This product could not be found."}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-jersea-neonBlue px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-jersea-bg text-white">
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(33,212,253,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(255,60,172,0.12),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
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

          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-jersea-muted">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
                <div className="aspect-[4/5]">
                  <img
                    src={selectedImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {galleryImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((image) => {
                    const resolvedImage = resolveImageUrl(image);
                    const isActive = image === selectedImage;

                    return (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`overflow-hidden rounded-2xl border transition ${
                          isActive
                            ? "border-jersea-neonBlue shadow-neon"
                            : "border-white/10 hover:border-jersea-pink/60"
                        }`}
                      >
                        <div className="aspect-square bg-black/30">
                          <img
                            src={resolvedImage}
                            alt={`${product.name} preview`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="xl:sticky xl:top-24 xl:h-fit">
              <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-md">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-jersea-neonBlue">
                      {product.category}
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold text-white">
                      {product.name}
                    </h1>
                    <p className="mt-3 max-w-xl text-base text-jersea-muted">
                      {product.shortDescription}
                    </p>
                  </div>
                  {product.isFeatured ? (
                    <span className="rounded-full border border-jersea-pink/30 bg-jersea-pink/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-jersea-pink">
                      Featured
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-3xl font-semibold text-white">
                      INR {formatPrice(product.price)}
                    </p>
                    {product.compareAtPrice &&
                    Number(product.compareAtPrice) > Number(product.price) ? (
                      <p className="text-lg text-jersea-muted line-through">
                        INR {formatPrice(product.compareAtPrice)}
                      </p>
                    ) : null}
                    {discountPercent ? (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                        {discountPercent}% off
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <div className="rounded-full border border-white/10 px-3 py-2 text-jersea-muted">
                      {product.stock > 5
                        ? "In stock"
                        : `Only ${product.stock} left`}
                    </div>
                    {product.sku ? (
                      <div className="rounded-full border border-white/10 px-3 py-2 text-jersea-muted">
                        SKU {product.sku}
                      </div>
                    ) : null}
                    <div className="rounded-full border border-white/10 px-3 py-2 text-jersea-muted">
                      {product.sizes.length} size options
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                      Select Size
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
                      Choose your fit
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                          selectedSize === size
                            ? "border-jersea-neonBlue bg-jersea-neonBlue/15 text-jersea-neonBlue"
                            : "border-white/10 text-white hover:border-jersea-pink/60 hover:text-jersea-pink"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || storeLoading || product.stock === 0}
                    className="rounded-2xl bg-jersea-neonBlue px-5 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-jersea-volt disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingToCart ? "Adding..." : "Add to cart"}
                  </button>
                  <Link
                    href="/cart"
                    className="rounded-2xl border border-white/10 px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-jersea-pink/60 hover:text-jersea-pink"
                  >
                    Open cart
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
                      Category
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {product.category}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
                      Available Sizes
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {product.sizes.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
                      Inventory
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {product.stock} units ready
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                    Product Details
                  </p>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                    {product.description
                      .split(/\n+/)
                      .filter(Boolean)
                      .map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length ? (
            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                    More to explore
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    More from {product.category}
                  </h2>
                </div>
                <Link
                  href="/#marketplace"
                  className="text-sm font-medium text-jersea-neonBlue transition hover:text-jersea-volt"
                >
                  Back to all products
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug || relatedProduct.id}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-jersea-surface/80 transition hover:border-jersea-neonBlue/60"
                  >
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={resolveImageUrl(relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
                        {relatedProduct.category}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white transition group-hover:text-jersea-neonBlue">
                        {relatedProduct.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-jersea-muted">
                        {relatedProduct.shortDescription}
                      </p>
                      <p className="mt-4 text-base font-semibold text-jersea-volt">
                        INR {relatedProduct.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
