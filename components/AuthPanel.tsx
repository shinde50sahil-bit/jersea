"use client";

import { useState } from "react";

type AuthMode = "login" | "register";

type AuthPanelProps = {
  loading: boolean;
  error: string | null;
  onSubmit: (payload: {
    mode: AuthMode;
    fullName?: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
};

export default function AuthPanel({
  loading,
  error,
  onSubmit
}: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      mode,
      fullName,
      email,
      phone,
      password
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-jersea-surface/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-jersea-muted">
            Customer Access
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {mode === "login" ? "Login to your account" : "Create your account"}
          </h3>
        </div>
        <div className="flex rounded-full border border-white/10 p-1">
          {(["login", "register"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                mode === value
                  ? "bg-jersea-neonBlue text-black"
                  : "text-jersea-muted"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" ? (
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-jersea-neonBlue/60"
            required
          />
        ) : null}

        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-jersea-neonBlue/60"
          required
        />

        {mode === "register" ? (
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-jersea-neonBlue/60"
          />
        ) : null}

        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-jersea-neonBlue/60"
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
          className="w-full rounded-xl bg-jersea-neonBlue px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-jersea-volt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Login"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
