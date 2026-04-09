"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthResponse } from "@/types/store";
import { apiRequest, storeToken } from "@/utils/api";

type AuthPageProps = {
  mode: "login" | "signup";
};

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest<{ data: AuthResponse }>(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            fullName,
            phone,
            email,
            password
          })
        }
      );

      storeToken(response.data.token);
      router.push(redirectTo);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-jersea-bg px-4 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-jersea-surface/80 p-8 backdrop-blur-md">
        <p className="text-xs uppercase tracking-[0.2em] text-jersea-neonBlue">
          Jersea Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          {mode === "login" ? "Login to continue shopping" : "Create your account"}
        </h1>
        <p className="mt-3 text-sm text-jersea-muted">
          {mode === "login"
            ? "Access your cart, saved addresses, and orders."
            : "Create an account to save your cart and place orders faster."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" ? (
            <>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
                required
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
              />
            </>
          ) : null}

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-jersea-neonBlue/60"
            required
          />

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
            disabled={loading}
            className="w-full rounded-xl bg-jersea-neonBlue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-jersea-muted">
          <Link href="/" className="transition hover:text-white">
            Back to store
          </Link>
          {mode === "login" ? (
            <Link href="/signup" className="transition hover:text-jersea-neonBlue">
              Need an account? Sign up
            </Link>
          ) : (
            <Link href="/login" className="transition hover:text-jersea-neonBlue">
              Already have an account? Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
