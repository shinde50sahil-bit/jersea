"use client";

import { useState } from "react";
import { Address, CartState, Order } from "@/types/store";

type CheckoutPanelProps = {
  isAuthenticated: boolean;
  addresses: Address[];
  cart: CartState;
  orders: Order[];
  loading: boolean;
  addressLoading: boolean;
  checkoutLoading: boolean;
  message: string | null;
  error: string | null;
  onSaveAddress: (payload: {
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
  }) => Promise<void>;
  onPlaceOrder: (payload: { addressId: string; notes: string }) => Promise<void>;
};

export default function CheckoutPanel({
  isAuthenticated,
  addresses,
  cart,
  orders,
  loading,
  addressLoading,
  checkoutLoading,
  message,
  error,
  onSaveAddress,
  onPlaceOrder
}: CheckoutPanelProps) {
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [notes, setNotes] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  async function handleSaveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSaveAddress({
      label,
      fullName,
      phone,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      isDefault: addresses.length === 0
    });
    setSelectedAddressId("");
  }

  async function handlePlaceOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onPlaceOrder({
      addressId:
        selectedAddressId || addresses.find((address) => address.isDefault)?.id || "",
      notes
    });
    setNotes("");
  }

  const shippingFee = cart.summary.subtotal >= 999 ? 0 : cart.summary.itemCount > 0 ? 99 : 0;
  const total = cart.summary.subtotal + shippingFee;

  return (
    <div id="checkout-panel" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
            Delivery
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            Save your shipping address
          </h3>

          {!isAuthenticated ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
              Login first to add delivery details.
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal code" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60" required />
              <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Address line 1" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60 md:col-span-2" required />
              <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Address line 2 (optional)" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60 md:col-span-2" />
              <button type="submit" disabled={addressLoading} className="rounded-xl bg-jersea-neonBlue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt disabled:opacity-60 md:col-span-2">
                {addressLoading ? "Saving..." : "Save address"}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
            Orders
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            Checkout and order history
          </h3>

          {message ? (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          {!isAuthenticated ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
              Login first to place an order.
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
              <select
                value={selectedAddressId}
                onChange={(event) => setSelectedAddressId(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              >
                <option value="">Use default address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.city}, {address.state}
                  </option>
                ))}
              </select>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Order note (optional)"
                className="min-h-28 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              />

              <button
                type="submit"
                disabled={checkoutLoading || cart.items.length === 0 || addresses.length === 0}
                className="w-full rounded-xl bg-jersea-pink px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? "Placing order..." : "Place cash on delivery order"}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-sm text-jersea-muted">Loading orders...</p>
            ) : null}
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.orderNumber}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-jersea-muted">
                      {order.status} • {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-jersea-volt">
                    INR {Number(order.totalAmount).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="mt-3 text-sm text-slate-300">
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

      <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5 xl:sticky xl:top-24 xl:h-fit">
        <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
          Checkout Summary
        </p>
        <h3 className="mt-1 text-xl font-semibold text-white">Ready to ship</h3>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between text-jersea-muted">
            <span>Items</span>
            <span>{cart.summary.itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-jersea-muted">
            <span>Subtotal</span>
            <span>INR {cart.summary.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-jersea-muted">
            <span>Shipping</span>
            <span>INR {shippingFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
            <span>Total</span>
            <span>INR {total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
          <p>Payment mode for this MVP: Cash on Delivery.</p>
          <p className="mt-2">Free shipping unlocks automatically above INR 999.</p>
        </div>
      </div>
    </div>
  );
}
