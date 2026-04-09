"use client";
import Link from "next/link";

type StoreHeaderProps = {
  customerName?: string;
  cartCount: number;
  onLogout: () => void;
};

export default function StoreHeader({
  customerName,
  cartCount,
  onLogout
}: StoreHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-jersea-muted">
          Store Control
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          {customerName ? `Welcome back, ${customerName}` : "Build your order"}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue"
        >
          Shop
        </Link>
        <Link
          href="/cart"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-neonBlue/50 hover:text-jersea-neonBlue"
        >
          Cart ({cartCount})
        </Link>
        <Link
          href="/checkout"
          className="rounded-full border border-jersea-neonBlue/40 bg-jersea-neonBlue/10 px-4 py-2 text-sm font-medium text-jersea-neonBlue transition hover:bg-jersea-neonBlue/20"
        >
          Checkout
        </Link>
        {customerName ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-pink/50 hover:text-jersea-pink"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-jersea-neonBlue px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-jersea-volt"
          >
            Login
          </Link>
        )}
        {!customerName ? (
          <Link
            href="/signup"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-jersea-pink/50 hover:text-jersea-pink"
          >
            Sign Up
          </Link>
        ) : null}
      </div>
    </div>
  );
}
