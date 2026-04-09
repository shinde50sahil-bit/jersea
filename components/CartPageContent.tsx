"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CartPanel from "@/components/CartPanel";
import StoreHeader from "@/components/StoreHeader";
import { AuthUser, CartState } from "@/types/store";
import { apiRequest, clearStoredToken, getStoredToken } from "@/utils/api";

export default function CartPageContent() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartState>({
    items: [],
    summary: { itemCount: 0, subtotal: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadCart() {
      try {
        setLoading(true);
        setError(null);

        const [meResponse, cartResponse] = await Promise.all([
          apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", { token }),
          apiRequest<{ data: CartState }>("/api/cart", { token })
        ]);

        setUser(meResponse.data.user);
        setCart(cartResponse.data);
      } catch (loadError) {
        clearStoredToken();
        setToken(null);
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load cart"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [token]);

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setCart({ items: [], summary: { itemCount: 0, subtotal: 0 } });
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (!token) return;

    try {
      const response = await apiRequest<{ data: CartState }>(
        `/api/cart/items/${itemId}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ quantity })
        }
      );
      setCart(response.data);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update cart"
      );
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!token) return;

    try {
      const response = await apiRequest<{ data: CartState }>(
        `/api/cart/items/${itemId}`,
        {
          method: "DELETE",
          token
        }
      );
      setCart(response.data);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove item"
      );
    }
  }

  return (
    <div className="min-h-screen bg-jersea-bg px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <StoreHeader
          customerName={user?.fullName}
          cartCount={cart.summary.itemCount}
          onLogout={handleLogout}
        />

        {!token ? (
          <div className="rounded-3xl border border-white/10 bg-jersea-surface/80 p-8">
            <h1 className="text-3xl font-semibold text-white">Your cart is waiting</h1>
            <p className="mt-3 text-sm text-jersea-muted">
              Login first so we can load your cart and keep it synced across visits.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/login?redirect=/cart"
                className="rounded-full bg-jersea-neonBlue px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt"
              >
                Login
              </Link>
              <Link
                href="/signup?redirect=/cart"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50"
              >
                Sign up
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <CartPanel
              cart={cart}
              loading={loading}
              isAuthenticated={Boolean(user)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />

            <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5 xl:sticky xl:top-24 xl:h-fit">
              <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
                Cart Summary
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Ready for checkout
              </h2>

              {error ? (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-jersea-muted">
                  <span>Items</span>
                  <span>{cart.summary.itemCount}</span>
                </div>
                <div className="flex items-center justify-between text-jersea-muted">
                  <span>Subtotal</span>
                  <span>INR {cart.summary.subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-xl bg-jersea-pink px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:opacity-90"
              >
                Go to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
