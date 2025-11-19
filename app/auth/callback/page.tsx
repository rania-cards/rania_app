/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // Supabase JS will read the access_token from the URL fragment if present
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
          console.error("Error getting user after callback", error);
          setError("Could not complete sign-in. Please try again.");
          return;
        }

        const user = data.user;

        // Ensure a row in our 'users' table
        await fetch("/api/auth/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
          }),
        });

        // Read redirect param from current URL (no useSearchParams)
        const url = new URL(window.location.href);
        const redirect = url.searchParams.get("redirect") || "/dashboard";

        router.replace(redirect);
      } catch (err: any) {
        console.error(err);
        setError("Something went wrong while completing sign-in.");
      }
    }

    handleAuth();
  }, [supabase, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full border border-slate-800 bg-slate-950/90 rounded-3xl p-6 text-center space-y-3">
        <h1 className="text-xl font-semibold text-slate-50">
          Finishing sign-in…
        </h1>
        <p className="text-sm text-slate-300">
          We&apos;re checking your magic link and loading your RANIA space.
        </p>
        {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}