"use client";

import { useEffect, useMemo, useState } from "react";
import { BackendProduct, ProductSize } from "@/types/product";
import {
  AdminDashboardPayload,
  AdminOrder,
  AdminProductPayload
} from "@/types/admin";
import { AuthUser } from "@/types/store";
import {
  apiRequest,
  clearStoredToken,
  getStoredToken,
  storeToken
} from "@/utils/api";
import { resolveImageUrl } from "@/utils/images";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
] as const;

const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;
const sizeOptions: ProductSize[] = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28"
];

type AuthMode = "login" | "register";

function uniqueImageUrls(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );
}

function createEmptyProductForm(): AdminProductPayload {
  return {
    name: "",
    shortDescription: "",
    description: "",
    category: "Football",
    price: 0,
    compareAtPrice: undefined,
    imageUrl: "",
    gallery: [],
    sizes: ["M", "L"],
    stock: 10,
    sku: "",
    isFeatured: false,
    isActive: true
  };
}

function createProductFormFromProduct(product: BackendProduct): AdminProductPayload {
  return {
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description || "",
    category: product.category,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : undefined,
    imageUrl: product.imageUrl,
    gallery: product.gallery || [],
    sizes: product.sizes,
    stock: product.stock,
    sku: product.sku || "",
    isFeatured: Boolean(product.isFeatured),
    isActive: true
  };
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("admin@jersea.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [archiveLoadingId, setArchiveLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardPayload | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [productForm, setProductForm] = useState<AdminProductPayload>(
    createEmptyProductForm()
  );

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const activeToken = token;

    async function loadAdmin() {
      try {
        setLoading(true);
        setError(null);

        const meResponse = await apiRequest<{ data: { user: AuthUser } }>(
          "/api/auth/me",
          { token }
        );

        if (meResponse.data.user.role !== "admin") {
          throw new Error("This account is not an admin account.");
        }

        setUser(meResponse.data.user);
        await refreshAdminData(activeToken);
      } catch (loadError) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setDashboard(null);
        setOrders([]);
        setProducts([]);
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load admin"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [token]);

  async function refreshAdminData(activeToken: string) {
    const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
      apiRequest<{ data: AdminDashboardPayload }>("/api/admin/stats", {
        token: activeToken
      }),
      apiRequest<{ data: { orders: AdminOrder[] } }>("/api/admin/orders", {
        token: activeToken
      }),
      apiRequest<{ data: { products: BackendProduct[] } }>(
        "/api/products?limit=1000",
        {
          token: activeToken
        }
      )
    ]);

    setDashboard(statsResponse.data);
    setOrders(ordersResponse.data.orders);
    setProducts(productsResponse.data.products);
  }

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setAuthLoading(true);
      setError(null);
      setMessage(null);

      const response = await apiRequest<{
        data: { token: string; user: AuthUser };
      }>(authMode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password
        })
      });

      if (response.data.user.role !== "admin") {
        throw new Error("Use an admin account to access this page.");
      }

      storeToken(response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      setMessage("Admin session ready.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Auth failed");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setDashboard(null);
    setOrders([]);
    setProducts([]);
    setMessage("Logged out from admin.");
  }

  function toggleSize(size: ProductSize) {
    setProductForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((value) => value !== size)
        : [...current.sizes, size]
    }));
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    try {
      setSavingProduct(true);
      setError(null);
      setMessage(null);

      await apiRequest(
        editingProductId ? `/api/products/${editingProductId}` : "/api/products",
        {
          method: editingProductId ? "PATCH" : "POST",
          token,
          body: JSON.stringify({
            ...productForm,
            description:
              productForm.description?.trim() || (editingProductId ? "" : undefined),
            compareAtPrice:
              productForm.compareAtPrice && productForm.compareAtPrice > 0
                ? productForm.compareAtPrice
                : undefined,
            gallery: uniqueImageUrls(productForm.gallery),
            sku: productForm.sku || undefined
          })
        }
      );

      await refreshAdminData(token);
      setEditingProductId(null);
      setProductForm(createEmptyProductForm());
      setMessage(
        editingProductId
          ? "Product updated successfully."
          : "Product created successfully."
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : editingProductId
            ? "Could not update product"
            : "Could not create product"
      );
    } finally {
      setSavingProduct(false);
    }
  }

  function handleEditProduct(product: BackendProduct) {
    setEditingProductId(product.id);
    setProductForm(createProductFormFromProduct(product));
    setError(null);
    setMessage(`Editing ${product.name}`);

    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  function handleCancelEdit() {
    setEditingProductId(null);
    setProductForm(createEmptyProductForm());
    setError(null);
    setMessage("Edit cancelled.");
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0 || !token) {
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      setMessage(null);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiRequest<{ data: { imageUrls: string[] } }>(
        "/api/products/upload-images",
        {
          method: "POST",
          token,
          body: formData
        }
      );

      setProductForm((current) => {
        const mergedImages = uniqueImageUrls([
          current.imageUrl,
          ...current.gallery,
          ...response.data.imageUrls
        ]);
        const [imageUrl = "", ...gallery] = mergedImages;

        return {
          ...current,
          imageUrl,
          gallery
        };
      });
      setMessage("Images uploaded successfully.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload images"
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function handleGalleryUrlsChange(value: string) {
    setProductForm((current) => ({
      ...current,
      gallery: uniqueImageUrls(
        value
          .split(/\r?\n|,/)
          .map((item) => item.trim())
          .filter(Boolean)
      ).filter((url) => url !== current.imageUrl.trim())
    }));
  }

  function handleSetCoverImage(imageUrl: string) {
    setProductForm((current) => ({
      ...current,
      imageUrl,
      gallery: uniqueImageUrls([current.imageUrl, ...current.gallery]).filter(
        (url) => url !== imageUrl
      )
    }));
  }

  function handleRemoveImage(imageUrl: string) {
    setProductForm((current) => {
      const remainingImages = uniqueImageUrls([
        current.imageUrl,
        ...current.gallery
      ]).filter((url) => url !== imageUrl);
      const [nextCover = "", ...gallery] = remainingImages;

      return {
        ...current,
        imageUrl: nextCover,
        gallery
      };
    });
  }

  async function handleArchiveProduct(productId: string) {
    if (!token) return;

    try {
      setArchiveLoadingId(productId);
      setError(null);
      setMessage(null);
      await apiRequest(`/api/products/${productId}/archive`, {
        method: "PATCH",
        token
      });
      await refreshAdminData(token);
      if (editingProductId === productId) {
        setEditingProductId(null);
        setProductForm(createEmptyProductForm());
      }
      setMessage("Product archived successfully.");
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive product"
      );
    } finally {
      setArchiveLoadingId(null);
    }
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    if (!token) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete "${productName}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleteLoadingId(productId);
      setError(null);
      setMessage(null);
      await apiRequest(`/api/products/${productId}`, {
        method: "DELETE",
        token
      });
      await refreshAdminData(token);
      if (editingProductId === productId) {
        setEditingProductId(null);
        setProductForm(createEmptyProductForm());
      }
      setMessage("Product deleted permanently.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete product"
      );
    } finally {
      setDeleteLoadingId(null);
    }
  }

  async function handleOrderStatusUpdate(
    orderId: string,
    status: string,
    paymentStatus: string
  ) {
    if (!token) return;

    try {
      setStatusLoadingId(orderId);
      setError(null);
      setMessage(null);
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          status,
          paymentStatus
        })
      });
      await refreshAdminData(token);
      setMessage("Order updated successfully.");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update order"
      );
    } finally {
      setStatusLoadingId(null);
    }
  }

  const revenueLabel = useMemo(
    () => Number(dashboard?.stats.revenue || 0).toLocaleString("en-IN"),
    [dashboard]
  );
  const productImagePreview = productForm.imageUrl
    ? resolveImageUrl(productForm.imageUrl)
    : "";
  const productImages = uniqueImageUrls([
    productForm.imageUrl,
    ...productForm.gallery
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-jersea-bg px-4 py-10 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-jersea-surface/80 p-8 text-center text-jersea-muted">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-jersea-bg px-4 py-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-jersea-surface/80 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-jersea-neonBlue">
            Jersea Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Sign in to manage the store
          </h1>
          <p className="mt-3 text-sm text-jersea-muted">
            Use the seeded admin account or any backend user with the `admin`
            role.
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <p>Default admin email: `admin@jersea.com`</p>
            <p className="mt-1">Default admin password: `ChangeMe123!`</p>
          </div>

          <div className="mt-5 flex rounded-full border border-white/10 p-1">
            {(["login", "register"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  authMode === mode
                    ? "bg-jersea-neonBlue text-black"
                    : "text-jersea-muted"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-5 space-y-3">
            {authMode === "register" ? (
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                required
              />
            ) : null}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              required
            />
            {authMode === "register" ? (
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              />
            ) : null}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              required
            />

            {error ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-jersea-neonBlue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt disabled:opacity-60"
            >
              {authLoading ? "Please wait..." : "Open admin dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jersea-bg px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-6 backdrop-blur-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-jersea-neonBlue">
                Jersea Admin
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-white">
                Store operations dashboard
              </h1>
              <p className="mt-2 text-sm text-jersea-muted">
                Manage catalog, monitor revenue, and keep orders moving.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue"
              >
                Back to storefront
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-pink/50 hover:text-jersea-pink"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
              Users
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {dashboard?.stats.users || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
              Active Products
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {dashboard?.stats.products || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
              Orders
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {dashboard?.stats.orders || 0}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-jersea-muted">
              Revenue
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              INR {revenueLabel}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                Inventory Alerts
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Low stock products
              </h2>
              <div className="mt-4 space-y-3">
                {dashboard?.lowStockProducts.length ? (
                  dashboard.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="mt-1 text-sm text-jersea-muted">
                        {product.category} • {product.stock} left
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
                    No low stock alerts right now.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                Catalog
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {editingProductId ? "Edit product" : "Create a new product"}
              </h2>
              <p className="mt-2 text-sm text-jersea-muted">
                {editingProductId
                  ? "Update the selected product and save your changes."
                  : "Create a new catalog item with cover image, gallery, pricing, and sizes."}
              </p>

              <form onSubmit={handleCreateProduct} className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Product name"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60 md:col-span-2"
                  required
                />
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value
                    }))
                  }
                  placeholder="Category"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                  required
                />
                <input
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      sku: event.target.value
                    }))
                  }
                  placeholder="SKU"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                />
                <input
                  value={productForm.price || ""}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: Number(event.target.value)
                    }))
                  }
                  type="number"
                  min="1"
                  placeholder="Price"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                  required
                />
                <input
                  value={productForm.compareAtPrice || ""}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      compareAtPrice: event.target.value
                        ? Number(event.target.value)
                        : undefined
                    }))
                  }
                  type="number"
                  min="1"
                  placeholder="Compare at price"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                />
                <input
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      stock: Number(event.target.value)
                    }))
                  }
                  type="number"
                  min="0"
                  placeholder="Stock"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                  required
                />
                <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-4 md:col-span-2">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Product images
                      </p>
                      <p className="mt-1 text-xs text-jersea-muted">
                        Upload 3-4 images. The first image becomes the cover and the rest appear in the gallery.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {uploadingImage ? "Uploading..." : "Upload images"}
                    </label>
                  </div>

                  <input
                    value={productForm.imageUrl}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        imageUrl: event.target.value,
                        gallery: uniqueImageUrls(current.gallery).filter(
                          (url) => url !== event.target.value.trim()
                        )
                      }))
                    }
                    placeholder="Cover image URL or uploaded image path"
                    className="mt-4 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                    required
                  />

                  <textarea
                    value={productForm.gallery.join("\n")}
                    onChange={(event) => handleGalleryUrlsChange(event.target.value)}
                    placeholder="Additional gallery image URLs, one per line"
                    className="mt-4 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                  />

                  {productImagePreview ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      <div className="aspect-[4/3] bg-black/20">
                        <img
                          src={productImagePreview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="border-t border-white/10 px-4 py-3 text-xs text-jersea-muted">
                        Cover image preview.
                      </p>
                    </div>
                  ) : null}

                  {productImages.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {productImages.map((imageUrl, index) => {
                        const isCover = imageUrl === productForm.imageUrl;

                        return (
                          <div
                            key={imageUrl}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                          >
                            <div className="aspect-square bg-black/20">
                              <img
                                src={resolveImageUrl(imageUrl)}
                                alt={`Product image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3 text-xs text-jersea-muted">
                              <span>{isCover ? "Cover image" : `Gallery ${index}`}</span>
                              <div className="flex gap-2">
                                {!isCover ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverImage(imageUrl)}
                                    className="rounded-full border border-white/10 px-2 py-1 text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue"
                                  >
                                    Make cover
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(imageUrl)}
                                  className="rounded-full border border-white/10 px-2 py-1 text-white transition hover:border-jersea-pink/50 hover:text-jersea-pink"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
                <input
                  value={productForm.shortDescription}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      shortDescription: event.target.value
                    }))
                  }
                  placeholder="Short description"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60 md:col-span-2"
                  required
                />
                <textarea
                  value={productForm.description || ""}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                  placeholder="Long description (optional)"
                  className="min-h-32 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60 md:col-span-2"
                />

                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-medium text-white">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          productForm.sizes.includes(size)
                            ? "border-jersea-neonBlue bg-jersea-neonBlue/15 text-jersea-neonBlue"
                            : "border-white/10 bg-black/20 text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                  <input
                    checked={productForm.isFeatured}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        isFeatured: event.target.checked
                      }))
                    }
                    type="checkbox"
                  />
                  Featured product
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      savingProduct || uploadingImage || productForm.sizes.length === 0
                    }
                    className="rounded-xl bg-jersea-neonBlue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt disabled:opacity-60"
                  >
                    {savingProduct
                      ? "Saving..."
                      : editingProductId
                        ? "Update product"
                        : "Create product"}
                  </button>
                  {editingProductId ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={savingProduct}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white/30 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                Product List
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Active catalog
              </h2>
              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="mt-1 text-sm text-jersea-muted">
                          {product.category} • INR{" "}
                          {Number(product.price).toLocaleString("en-IN")} • Stock{" "}
                          {product.stock}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          disabled={
                            archiveLoadingId === product.id ||
                            deleteLoadingId === product.id
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveProduct(product.id)}
                          disabled={
                            archiveLoadingId === product.id ||
                            deleteLoadingId === product.id
                          }
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-jersea-pink transition hover:border-jersea-pink/50 disabled:opacity-60"
                        >
                          {archiveLoadingId === product.id ? "Archiving..." : "Archive"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
                          disabled={
                            archiveLoadingId === product.id ||
                            deleteLoadingId === product.id
                          }
                          className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:border-red-400/50 hover:text-red-100 disabled:opacity-60"
                        >
                          {deleteLoadingId === product.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                Orders
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Fulfillment queue
              </h2>
              <div className="mt-4 space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{order.orderNumber}</p>
                        <p className="mt-1 text-sm text-jersea-muted">
                          {order.user?.fullName || "Customer"} • {order.user?.email}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-jersea-volt">
                        INR {Number(order.totalAmount).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <select
                        defaultValue={order.status}
                        onChange={(event) =>
                          handleOrderStatusUpdate(
                            order.id,
                            event.target.value,
                            order.paymentStatus
                          )
                        }
                        disabled={statusLoadingId === order.id}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <select
                        defaultValue={order.paymentStatus}
                        onChange={(event) =>
                          handleOrderStatusUpdate(
                            order.id,
                            order.status,
                            event.target.value
                          )
                        }
                        disabled={statusLoadingId === order.id}
                        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                      >
                        {paymentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 text-sm text-slate-300">
                      {order.items.map((item) => (
                        <p key={item.id}>
                          {item.productName} • {item.size} • Qty {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
