"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import StoreHeader from "@/components/StoreHeader";
import { Address, AuthUser, CartState, Order } from "@/types/store";
import { apiRequest, clearStoredToken, getStoredToken } from "@/utils/api";
import { resolveImageUrl } from "@/utils/images";

type Tab = "overview" | "orders" | "addresses" | "settings";

const statusColor: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  confirmed:  "bg-blue-500/15 text-blue-300 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  shipped:    "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  delivered:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelled:  "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function ProfilePageContent() {
  const router = useRouter();
  const [token, setToken]     = useState<string | null>(null);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [cart, setCart]       = useState<CartState>({ items: [], summary: { itemCount: 0, subtotal: 0 } });
  const [orders, setOrders]   = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("overview");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Settings form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<string | null>(null);

  useEffect(() => { setToken(getStoredToken()); }, []);

  useEffect(() => {
    if (token === null) return;
    if (!token) { setLoading(false); return; }

    async function load() {
      try {
        setLoading(true);
        const [me, cartRes, ordersRes, addrRes] = await Promise.all([
          apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", { token }),
          apiRequest<{ data: CartState }>("/api/cart", { token }),
          apiRequest<{ data: { orders: Order[] } }>("/api/orders", { token }),
          apiRequest<{ data: { addresses: Address[] } }>("/api/addresses", { token }),
        ]);
        setUser(me.data.user);
        setCart(cartRes.data);
        setOrders(ordersRes.data.orders);
        setAddresses(addrRes.data.addresses);
        setFullName(me.data.user.fullName);
        setPhone(me.data.user.phone || "");
      } catch {
        clearStoredToken();
        router.push("/login?redirect=/profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, router]);

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    router.push("/");
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      setSaving(true);
      setSaveMsg(null);
      await apiRequest("/api/auth/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({ fullName, phone }),
      });
      setUser((u) => u ? { ...u, fullName, phone } : u);
      setSaveMsg("Profile updated successfully!");
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview",   label: "Overview",   icon: "◈" },
    { id: "orders",     label: "Orders",     icon: "📦" },
    { id: "addresses",  label: "Addresses",  icon: "📍" },
    { id: "settings",   label: "Settings",   icon: "⚙" },
  ];

  // ── Not logged in ──────────────────────────────────
  if (!loading && !token) {
    return (
      <div className="min-h-screen bg-jersea-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">👤</div>
          <h1 className="text-3xl font-bold text-white mb-3">Sign in to view your profile</h1>
          <p className="text-white/50 mb-8 text-sm">Access your orders, addresses, and account details.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?redirect=/profile" className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 transition">Login</Link>
            <Link href="/signup?redirect=/profile" className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-jersea-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const initials = user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-jersea-bg text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <StoreHeader customerName={user?.fullName} cartCount={cart.summary.itemCount} onLogout={handleLogout} />

        {/* ── Profile Hero Banner ────────────────────── */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0b1a2e] via-[#0d1f35] to-[#091318]">
          {/* bg glows */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-10 right-10 h-48 w-48 rounded-full bg-blue-600/10 blur-[60px]" />

          <div className="relative z-10 flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            {/* Avatar */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-black text-black shadow-lg shadow-cyan-500/30">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-cyan-400/70">Jersea Member</p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{user?.fullName}</h1>
              <p className="mt-1 text-sm text-white/40">{user?.email}</p>
              {user?.phone && <p className="text-xs text-white/30 mt-0.5">{user.phone}</p>}
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:gap-6">
              {[
                { label: "Orders", value: orders.length },
                { label: "Delivered", value: orders.filter(o => o.status === "delivered").length },
                { label: "Spent", value: `₹${totalSpent.toLocaleString("en-IN")}` },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[0.6rem] uppercase tracking-widest text-white/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────── */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-cyan-500/15 text-cyan-300 shadow-inner"
                  : "text-white/40 hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Recent orders card */}
                <div className="col-span-full lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/50">Recent Orders</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🛒</div>
                      <p className="text-white/40 text-sm">No orders yet.</p>
                      <Link href="/" className="mt-3 inline-block text-xs text-cyan-400 hover:underline">Start shopping →</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">#{order.orderNumber}</p>
                            <p className="text-[0.65rem] text-white/40 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[0.62rem] font-semibold capitalize ${statusColor[order.status] || "bg-white/5 text-white/50 border-white/10"}`}>
                            {order.status}
                          </span>
                          <p className="text-sm font-bold text-cyan-400">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                      {orders.length > 3 && (
                        <button onClick={() => setTab("orders")} className="w-full text-center text-xs text-cyan-400/70 hover:text-cyan-300 py-1 transition">
                          View all {orders.length} orders →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-white/50">Quick Links</h2>
                  <div className="space-y-2">
                    {[
                      { label: "Browse Jerseys", href: "/", icon: "👕" },
                      { label: "My Cart", href: "/cart", icon: "🛒" },
                      { label: "Checkout", href: "/checkout", icon: "💳" },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm text-white/60 hover:border-cyan-500/30 hover:text-white transition-all">
                        <span>{l.icon}</span>{l.label}
                      </Link>
                    ))}
                  </div>

                  {/* Default address */}
                  {addresses.find(a => a.isDefault) && (
                    <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                      <p className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-1">Default Address</p>
                      {(() => { const a = addresses.find(ad => ad.isDefault)!;
                        return <p className="text-xs text-white/50 leading-relaxed">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-12 text-center">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-white/40 text-sm mb-6">Your order history will appear here.</p>
                    <Link href="/" className="inline-block rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 transition">Shop Now</Link>
                  </div>
                ) : orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                    {/* Order header */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full flex flex-wrap items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">#{order.orderNumber}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold capitalize ${statusColor[order.status] || "bg-white/5 text-white/40 border-white/10"}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          {" · "}{order.paymentMethod.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-cyan-400">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                        <p className="text-[0.6rem] text-white/30">{expandedOrder === order.id ? "▲ Hide" : "▼ Details"}</p>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence initial={false}>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/[0.06] p-4 space-y-4">
                            {/* Items */}
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                                  <img
                                    src={resolveImageUrl(item.productImage)}
                                    alt={item.productName}
                                    className="h-12 w-12 rounded-lg object-cover bg-black/30"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/jersey_logo.png"; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-white truncate">{item.productName}</p>
                                    <p className="text-[0.65rem] text-white/40">Size: {item.size} · Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-bold text-white">₹{Number(item.lineTotal).toLocaleString("en-IN")}</p>
                                </div>
                              ))}
                            </div>

                            {/* Shipping address */}
                            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                              <p className="text-[0.6rem] uppercase tracking-widest text-white/30 mb-1">Shipping To</p>
                              <p className="text-xs text-white/60 leading-relaxed">
                                {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
                                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                              </p>
                            </div>

                            {/* Totals */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {[
                                { label: "Subtotal", value: `₹${Number(order.subtotal).toLocaleString("en-IN")}` },
                                { label: "Shipping", value: `₹${Number(order.shippingFee).toLocaleString("en-IN")}` },
                                { label: "Total", value: `₹${Number(order.totalAmount).toLocaleString("en-IN")}` },
                              ].map((r) => (
                                <div key={r.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-2">
                                  <p className="text-[0.6rem] text-white/30 uppercase tracking-widest">{r.label}</p>
                                  <p className="text-sm font-bold text-white mt-0.5">{r.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* ADDRESSES */}
            {tab === "addresses" && (
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-12 text-center">
                    <div className="text-5xl mb-4">📍</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No saved addresses</h3>
                    <p className="text-white/40 text-sm mb-6">Add addresses at checkout for faster ordering.</p>
                    <Link href="/checkout" className="inline-block rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-400 transition">Go to Checkout</Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`rounded-2xl border p-5 transition-all ${addr.isDefault ? "border-cyan-500/40 bg-cyan-500/5" : "border-white/[0.07] bg-white/[0.02]"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60">{addr.label}</span>
                            {addr.isDefault && <span className="ml-2 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-cyan-400">Default</span>}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-white">{addr.fullName}</p>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                          {addr.city}, {addr.state} {addr.postalCode}<br />
                          {addr.country} · {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {tab === "settings" && (
              <div className="max-w-lg">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <h2 className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-white/50">Account Details</h2>
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/50">Full Name</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/50">Email</label>
                      <input
                        value={user?.email || ""}
                        disabled
                        className="w-full rounded-xl border border-white/[0.05] bg-white/[0.01] px-4 py-3 text-sm text-white/30 cursor-not-allowed"
                      />
                      <p className="mt-1 text-[0.65rem] text-white/25">Email cannot be changed.</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/50">Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    {saveMsg && (
                      <div className={`rounded-xl border px-4 py-3 text-sm ${saveMsg.includes("success") ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                        {saveMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-cyan-400 disabled:opacity-60 transition"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </form>

                  {/* Danger zone */}
                  <div className="mt-6 border-t border-white/[0.06] pt-6">
                    <p className="text-[0.6rem] uppercase tracking-widest text-white/20 mb-3">Session</p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl border border-red-500/25 bg-red-500/5 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/15 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
