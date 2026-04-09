"use client";

import { CartState } from "@/types/store";
import { resolveImageUrl } from "@/utils/images";

type CartPanelProps = {
  cart: CartState;
  loading: boolean;
  isAuthenticated: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
};

export default function CartPanel({
  cart,
  loading,
  isAuthenticated,
  onUpdateQuantity,
  onRemoveItem
}: CartPanelProps) {
  return (
    <div id="cart-panel" className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
            Cart
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">Your lineup</h3>
        </div>
        <p className="text-sm text-jersea-muted">
          {cart.summary.itemCount} items
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
          Login to save your cart and place an order.
        </div>
      ) : null}

      {isAuthenticated && cart.items.length === 0 && !loading ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-jersea-muted">
          Your cart is empty. Add a jersey to start checkout.
        </div>
      ) : null}

      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="relative h-24 w-20 overflow-hidden rounded-xl">
              <img
                src={resolveImageUrl(item.product.imageUrl)}
                alt={item.product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white">
                {item.product.name}
              </h4>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-jersea-muted">
                Size {item.size}
              </p>
              <p className="mt-2 text-sm font-medium text-jersea-volt">
                INR {item.lineTotal.toLocaleString("en-IN")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white transition hover:border-jersea-neonBlue/60"
                >
                  -
                </button>
                <span className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="rounded-lg border border-white/10 px-3 py-1 text-sm text-white transition hover:border-jersea-neonBlue/60"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="rounded-lg border border-white/10 px-3 py-1 text-sm text-jersea-pink transition hover:border-jersea-pink/60"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between text-sm text-jersea-muted">
          <span>Subtotal</span>
          <span>INR {cart.summary.subtotal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
