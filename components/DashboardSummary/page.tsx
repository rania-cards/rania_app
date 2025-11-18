"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { RaniaMoment } from "@/types";
import Link from "next/link";

export default function DashboardSummary() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [moments, setMoments] = useState<RaniaMoment[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user in dashboard", error);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setLoading(false);
        return;
      }

      setUserId(data.user.id);

      try {
        const res = await fetch(
          `/api/moments?userId=${encodeURIComponent(data.user.id)}`
        );
        const json = await res.json();
        setMoments(json.moments ?? []);
      } catch (err) {
        console.error("Error fetching moments for dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-sm font-semibold mb-2">Your moments</h2>
        <p className="text-xs text-slate-300">Loading your RANIA history…</p>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
        <h2 className="text-sm font-semibold mb-1">Your moments</h2>
        <p className="text-xs text-slate-300">
          You&apos;re not signed in. Sign in to see your saved moments.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400"
        >
          Sign in to RANIA
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="text-sm font-semibold mb-2">Your moments</h2>
      {moments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 p-3 text-xs text-slate-500">
          No moments yet. Start by creating your first moment and it will appear
          here.
        </div>
      ) : (
        <div className="space-y-2">
          {moments.slice(0, 10).map((m) => {
            const created = new Date(m.created_at).toLocaleString();
            const deliveryLabel =
              m.delivery_type === "text"
                ? "Text"
                : m.delivery_type === "user_voice"
                ? "Your voice"
                : m.delivery_type === "user_video"
                ? "Your video"
                : m.delivery_type === "kid_voice"
                ? "Kid voice"
                : "Kid video";

            return (
              <div
                key={m.id}
                className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs text-slate-200">
                    To{" "}
                    <span className="font-semibold">
                      {m.receiver_name || "Someone special"}
                    </span>{" "}
                    · {m.occasion || "Moment"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {deliveryLabel} ·{" "}
                    {m.is_premium
                      ? `Premium (KES ${m.price_charged})`
                      : "Free with watermark"}{" "}
                    · {created}
                  </p>
                </div>
                <Link
                  href={`/moment/${m.id}`}
                  className="text-[11px] text-emerald-300 hover:underline flex-shrink-0"
                >
                  View
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}