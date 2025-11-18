"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthPage() {
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setError(error.message);
        setStatus("error");
      } else {
        setStatus("sent");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full border border-slate-800 bg-slate-950/90 rounded-3xl p-6 space-y-5">
        <h1 className="text-2xl font-bold text-slate-50 mb-1">
          Sign in to RANIA 💛
        </h1>
        <p className="text-sm text-slate-300">
          Use your email to get a magic link. No passwords, no stress — just
          moments.
        </p>

        <form onSubmit={handleSendMagicLink} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-emerald-500 text-slate-950 text-sm font-medium py-2 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {status === "sending"
              ? "Sending magic link..."
              : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <p className="text-xs text-emerald-300">
            Check your email for a magic link. Open it on this device and
            you&apos;ll be signed in automatically.
          </p>
        )}

        {status === "error" && error && (
          <p className="text-xs text-rose-400">Error: {error}</p>
        )}
      </div>
    </div>
  );
}