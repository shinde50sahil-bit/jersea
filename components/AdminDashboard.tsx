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
  const [adminPage, setAdminPage] = useState<"overview" | "add" | "products" | "orders">("overview");

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
    setAdminPage("add");
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

  const navBtn = (id: typeof adminPage, icon: string, label: string, badge?: number) => (
    <button key={id} type="button" onClick={() => setAdminPage(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${adminPage === id ? "bg-cyan-500/15 text-cyan-300" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
      <span>{icon}</span><span className="flex-1 text-left">{label}</span>
      {badge !== undefined && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${adminPage === id ? "bg-cyan-500/30 text-cyan-200" : "bg-white/10 text-white/40"}`}>{badge}</span>}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#080f18] text-white">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-white/[0.06] bg-[#0a1220] px-3 py-5">
        <div className="mb-6 px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-500">Jersea</p>
          <p className="text-sm font-bold text-white mt-0.5">Admin Panel</p>
          <p className="text-[10px] text-white/30 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 space-y-0.5">
          {navBtn("overview", "📊", "Overview")}
          {navBtn("add", "➕", editingProductId ? "Edit Product" : "Add Product")}
          {navBtn("products", "📦", "Products", products.length)}
          {navBtn("orders", "🚚", "Orders", orders.length)}
        </nav>
        <div className="border-t border-white/[0.06] pt-3 space-y-0.5 mt-4">
          <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/50 hover:bg-white/5 hover:text-white transition-all">🏠 Storefront</a>
          <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all">⏻ Logout</button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="ml-52 flex-1 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.06] bg-[#080f18]/90 backdrop-blur-md px-6 py-3">
          <div>
            <h1 className="text-sm font-bold text-white">{adminPage === "overview" ? "Dashboard" : adminPage === "add" ? (editingProductId ? "Edit Product" : "Add Product") : adminPage === "products" ? "Product Catalog" : "Order Management"}</h1>
            <p className="text-[10px] text-white/30">Jersea Admin · {user?.fullName}</p>
          </div>
          <div className="flex gap-2 max-w-sm">
            {message && <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg truncate">{message}</p>}
            {error && <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg truncate">{error}</p>}
          </div>
        </header>

        <main className="flex-1 p-6">

          {/* ── OVERVIEW ── */}
          {adminPage === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[{l:"Users",v:dashboard?.stats.users||0,c:"text-cyan-400"},{l:"Products",v:dashboard?.stats.products||0,c:"text-purple-400"},{l:"Orders",v:dashboard?.stats.orders||0,c:"text-yellow-400"},{l:"Revenue",v:`₹${revenueLabel}`,c:"text-emerald-400"}].map(s=>(
                  <div key={s.l} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">{s.l}</p>
                    <p className={`mt-2 text-2xl font-bold ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">⚠ Low Stock Alerts</h2>
                {dashboard?.lowStockProducts.length ? (
                  <div className="space-y-2">{dashboard.lowStockProducts.map(p=>(
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                      <div><p className="text-sm font-medium text-white">{p.name}</p><p className="text-xs text-white/40">{p.category}</p></div>
                      <span className="text-sm font-bold text-amber-400">{p.stock} left</span>
                    </div>
                  ))}</div>
                ) : <p className="text-sm text-white/30">No low stock alerts right now.</p>}
              </div>
            </div>
          )}

          {/* ── ADD / EDIT PRODUCT ── */}
          {adminPage === "add" && (
            <form onSubmit={handleCreateProduct} className="max-w-3xl space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={productForm.name} onChange={e=>setProductForm(c=>({...c,name:e.target.value}))} placeholder="Product name" className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <input value={productForm.category} onChange={e=>setProductForm(c=>({...c,category:e.target.value}))} placeholder="Category (e.g. Football)" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <input value={productForm.sku} onChange={e=>setProductForm(c=>({...c,sku:e.target.value}))} placeholder="SKU (optional)" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/>
                <input value={productForm.price||""} onChange={e=>setProductForm(c=>({...c,price:Number(e.target.value)}))} type="number" min="1" placeholder="Price (₹)" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <input value={productForm.compareAtPrice||""} onChange={e=>setProductForm(c=>({...c,compareAtPrice:e.target.value?Number(e.target.value):undefined}))} type="number" min="1" placeholder="Compare at price" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/>
                <input value={productForm.stock} onChange={e=>setProductForm(c=>({...c,stock:Number(e.target.value)}))} type="number" min="0" placeholder="Stock" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <input value={productForm.shortDescription} onChange={e=>setProductForm(c=>({...c,shortDescription:e.target.value}))} placeholder="Short description" className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <textarea value={productForm.description||""} onChange={e=>setProductForm(c=>({...c,description:e.target.value}))} placeholder="Long description (optional)" className="sm:col-span-2 min-h-24 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/>
              </div>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Product Images</p>
                  <label className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:border-cyan-500/40 transition">
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" multiple onChange={handleImageUpload} className="hidden"/>
                    {uploadingImage ? "Uploading…" : "Upload Images"}
                  </label>
                </div>
                <input value={productForm.imageUrl} onChange={e=>setProductForm(c=>({...c,imageUrl:e.target.value,gallery:uniqueImageUrls(c.gallery).filter(u=>u!==e.target.value.trim())}))} placeholder="Cover image URL" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" required/>
                <textarea value={productForm.gallery.join("\n")} onChange={e=>handleGalleryUrlsChange(e.target.value)} placeholder="Additional gallery URLs, one per line" className="min-h-16 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"/>
                {productImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {productImages.map((url, i) => {
                      const isCover = url === productForm.imageUrl;
                      return (
                        <div key={url} className="overflow-hidden rounded-xl border border-white/10">
                          <div className="aspect-square bg-black/20"><img src={resolveImageUrl(url)} alt={`img ${i+1}`} className="h-full w-full object-cover"/></div>
                          <div className="flex gap-1 p-1.5 border-t border-white/10 bg-black/20">
                            {!isCover && <button type="button" onClick={()=>handleSetCoverImage(url)} className="flex-1 rounded-lg bg-white/5 py-1 text-[10px] text-white hover:bg-cyan-500/20 hover:text-cyan-300 transition">Cover</button>}
                            <button type="button" onClick={()=>handleRemoveImage(url)} className="flex-1 rounded-lg bg-red-500/10 py-1 text-[10px] text-red-300 hover:bg-red-500/20 transition">✕</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-white">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(s=>(
                    <button key={s} type="button" onClick={()=>toggleSize(s)} className={`rounded-full border px-3 py-1.5 text-sm transition ${productForm.sizes.includes(s)?"border-cyan-500/60 bg-cyan-500/15 text-cyan-300":"border-white/10 bg-white/[0.02] text-white/50 hover:text-white"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input type="checkbox" checked={productForm.isFeatured} onChange={e=>setProductForm(c=>({...c,isFeatured:e.target.checked}))}/>
                Mark as Featured
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingProduct||uploadingImage||productForm.sizes.length===0} className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black hover:bg-cyan-400 disabled:opacity-60 transition">
                  {savingProduct ? "Saving…" : editingProductId ? "Update Product" : "Create Product"}
                </button>
                {editingProductId && <button type="button" onClick={handleCancelEdit} disabled={savingProduct} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">Cancel</button>}
              </div>
            </form>
          )}

          {/* ── PRODUCTS LIST ── */}
          {adminPage === "products" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/40">{products.length} products in catalog</p>
                <button type="button" onClick={()=>{setAdminPage("add");setEditingProductId(null);setProductForm(createEmptyProductForm());}} className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition">+ Add New Product</button>
              </div>
              {products.map(p=>(
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 hover:border-white/[0.12] transition">
                  <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="h-14 w-14 rounded-xl object-cover bg-black/30 flex-shrink-0" onError={e=>{(e.target as HTMLImageElement).src="/jersey_logo.png";}}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{p.category} · ₹{Number(p.price).toLocaleString("en-IN")} · Stock {p.stock}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={()=>handleEditProduct(p)} disabled={archiveLoadingId===p.id||deleteLoadingId===p.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white hover:border-cyan-500/40 hover:text-cyan-300 transition">Edit</button>
                    <button type="button" onClick={()=>handleArchiveProduct(p.id)} disabled={archiveLoadingId===p.id||deleteLoadingId===p.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/15 transition disabled:opacity-50">{archiveLoadingId===p.id?"…":"Archive"}</button>
                    <button type="button" onClick={()=>handleDeleteProduct(p.id,p.name)} disabled={archiveLoadingId===p.id||deleteLoadingId===p.id} className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/15 transition disabled:opacity-50">{deleteLoadingId===p.id?"…":"Delete"}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ORDERS ── */}
          {adminPage === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 && <p className="text-white/30 text-sm py-12 text-center">No orders yet.</p>}
              {orders.map(order=>(
                <div key={order.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] capitalize text-white/50">{order.paymentMethod}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{order.user?.fullName||"Customer"} · {order.user?.email}</p>
                      {order.user?.phone&&<p className="text-xs text-white/30">{order.user.phone}</p>}
                      <p className="text-[10px] text-white/25 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                    </div>
                    <p className="text-lg font-bold text-cyan-400">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="mb-4 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-cyan-400/60 mb-1.5">ðŸ“ Delivery Address</p>
                    <p className="text-sm font-semibold text-white">{order.shippingAddress.fullName}</p>
                    <p className="text-xs text-white/60 mt-0.5">{order.shippingAddress.phone}</p>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {order.shippingAddress.line1}{order.shippingAddress.line2?`, ${order.shippingAddress.line2}`:""}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                  </div>

                  <div className="mb-4 space-y-2">
                    {order.items.map(item=>(
                      <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                        <img src={resolveImageUrl(item.productImage)} alt={item.productName} className="h-9 w-9 rounded-lg object-cover bg-black/30 flex-shrink-0" onError={e=>{(e.target as HTMLImageElement).src="/jersey_logo.png";}}/>
                        <p className="flex-1 text-xs text-white/70">{item.productName} · Size {item.size} · Qty {item.quantity}</p>
                        <p className="text-xs font-bold text-white">₹{Number(item.lineTotal).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select defaultValue={order.status} onChange={e=>handleOrderStatusUpdate(order.id,e.target.value,order.paymentStatus)} disabled={statusLoadingId===order.id} className="rounded-xl border border-white/10 bg-[#0a1220] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50">
                      {orderStatuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                    <select defaultValue={order.paymentStatus} onChange={e=>handleOrderStatusUpdate(order.id,order.status,e.target.value)} disabled={statusLoadingId===order.id} className="rounded-xl border border-white/10 bg-[#0a1220] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50">
                      {paymentStatuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
