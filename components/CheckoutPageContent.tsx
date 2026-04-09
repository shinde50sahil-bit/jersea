"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CartPanel from "@/components/CartPanel";
import CheckoutPanel from "@/components/CheckoutPanel";
import StoreHeader from "@/components/StoreHeader";
import { Address, AuthUser, CartState, Order } from "@/types/store";
import { apiRequest, clearStoredToken, getStoredToken } from "@/utils/api";

export default function CheckoutPageContent() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartState>({
    items: [],
    summary: { itemCount: 0, subtotal: 0 }
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadData(token);
  }, [token]);

  async function loadData(activeToken: string) {
    try {
      setLoading(true);
      setError(null);
      const [meResponse, cartResponse, addressesResponse, ordersResponse] =
        await Promise.all([
          apiRequest<{ data: { user: AuthUser } }>("/api/auth/me", {
            token: activeToken
          }),
          apiRequest<{ data: CartState }>("/api/cart", { token: activeToken }),
          apiRequest<{ data: { addresses: Address[] } }>("/api/addresses", {
            token: activeToken
          }),
          apiRequest<{ data: { orders: Order[] } }>("/api/orders", {
            token: activeToken
          })
        ]);

      setUser(meResponse.data.user);
      setCart(cartResponse.data);
      setAddresses(addressesResponse.data.addresses);
      setOrders(ordersResponse.data.orders);
    } catch (loadError) {
      clearStoredToken();
      setToken(null);
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load checkout"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setCart({ items: [], summary: { itemCount: 0, subtotal: 0 } });
    setAddresses([]);
    setOrders([]);
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

  async function handleSaveAddress(payload: {
    label: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }) {
    if (!token) return;

    try {
      setAddressLoading(true);
      setError(null);
      setMessage(null);
      await apiRequest("/api/addresses", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
      });
      await loadData(token);
      setMessage("Address saved successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save address"
      );
    } finally {
      setAddressLoading(false);
    }
  }

  async function handlePlaceOrder(payload: {
    addressId: string;
    notes: string;
  }) {
    if (!token) return;

    try {
      setCheckoutLoading(true);
      setError(null);
      setMessage(null);
      await apiRequest("/api/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          addressId: payload.addressId,
          paymentMethod: "cod",
          notes: payload.notes
        })
      });
      await loadData(token);
      setMessage("Order placed successfully.");
    } catch (placeError) {
      setError(
        placeError instanceof Error
          ? placeError.message
          : "Unable to place order"
      );
    } finally {
      setCheckoutLoading(false);
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
            <h1 className="text-3xl font-semibold text-white">Checkout starts with login</h1>
            <p className="mt-3 text-sm text-jersea-muted">
              Sign in to access your cart, delivery address, and order placement.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/login?redirect=/checkout"
                className="rounded-full bg-jersea-neonBlue px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt"
              >
                Login
              </Link>
              <Link
                href="/signup?redirect=/checkout"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50"
              >
                Sign up
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <CartPanel
              cart={cart}
              loading={loading}
              isAuthenticated={Boolean(user)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />

            <CheckoutPanel
              isAuthenticated={Boolean(user)}
              addresses={addresses}
              cart={cart}
              orders={orders}
              loading={loading}
              addressLoading={addressLoading}
              checkoutLoading={checkoutLoading}
              message={message}
              error={error}
              onSaveAddress={handleSaveAddress}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
