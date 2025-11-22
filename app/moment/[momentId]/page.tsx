import type { MomentRow } from "./types";
import Link from "next/link";



type MomentApiResponse = {
  moment?: MomentRow;
  error?: string;
};

async function fetchMoment(momentId: string): Promise<MomentRow | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/moments/${momentId}`,
      { cache: "no-store" }
    );

    const data: MomentApiResponse = await res.json();
    if (!res.ok || !data?.moment) return null;
    return data.moment;
  } catch (e) {
    console.error("Error fetching moment", e);
    return null;
  }
}

export default async function MomentReceiverPage({
  params,
}: {
  params: { momentId: string };
}) {
  const moment = await fetchMoment(params.momentId);

  if (!moment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-950 via-slate-900 to-black text-slate-50">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">This moment isn&apos;t available</h1>
          <p className="text-sm text-slate-400">
            It may have been deleted or the link is incorrect.
          </p>
          <Link
            href="/create/moment"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Create your own moment
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-black text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-5 space-y-3 shadow-xl">
          <p className="text-xs text-slate-400">
            Someone created a moment for{" "}
            <span className="font-semibold text-slate-100">
              {moment.receiver_name || "you"}
            </span>
          </p>
          <div className="rounded-2xl bg-slate-900/90 p-4 space-y-2 border border-emerald-500/30">
            <p className="text-[11px] text-slate-400">
              Occasion:{" "}
              <span className="text-slate-100">
                {moment.occasion || "Special moment"}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              Relationship:{" "}
              <span className="text-slate-100">
                {moment.relationship || "Someone who cares about you"}
              </span>
            </p>
            <div className="mt-3 rounded-xl bg-slate-950/80 p-3">
              <p className="text-[11px] uppercase text-emerald-300 mb-1">
                Their message
              </p>
              <p className="text-sm text-slate-50 whitespace-pre-line">
                {moment.message_text || ""}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500 mt-2">
            Made with ❤️ on RANIA
          </p>
        </div>

        {/* CTA: Viral loop */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-2 text-center">
          <p className="text-sm font-semibold text-slate-100">
            Want to send your own moment back?
          </p>
          <p className="text-[11px] text-slate-400">
            Create a free text or GIF moment in under a minute.
          </p>
          <Link
            href="/create/moment"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 mt-2"
          >
            Create your own moment ✨
          </Link>
        </div>
      </div>
    </div>
  );
}