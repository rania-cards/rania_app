import Link from "next/link";

export default function Hero() {
  return (
    <div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Turn your feelings into unforgettable moments 💛
      </h1>
      <p className="text-slate-300 text-sm md:text-base mb-6">
        RANIA helps you craft emotional moments for the people you love —
        written by AI, delivered as text, your voice, your video, or even a
        playful kid avatar.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/create/moment"
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
        >
          Start for FREE
        </Link>
        <Link
          href="/(marketing)/pricing"
          className="rounded-full border border-slate-600 px-5 py-2 text-xs md:text-sm text-slate-50 hover:bg-slate-900 transition"
        >
          See how premium moments work
        </Link>
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        First text moments are free with a tiny watermark. Upgrade any moment
        for full quality and all delivery styles.
      </p>
    </div>
  );
}
