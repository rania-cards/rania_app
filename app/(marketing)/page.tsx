import Hero from "@/components/Hero/page";
export default function MarketingHomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-6xl mx-auto grid gap-12 md:grid-cols-[1.2fr,1fr] items-center">
        <div>
          <p className="inline-flex rounded-full bg-emerald-900/40 text-emerald-200 px-3 py-1 text-xs font-medium mb-4">
            RANIA · Moment creation platform
          </p>
          <Hero  />
        </div>

        <div className="relative w-full max-w-sm mx-auto">
          <div className="absolute inset-0 blur-3xl bg-linear-to-br from-emerald-500/40 via-amber-400/30 to-pink-500/40 opacity-40" />
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur">
            <p className="text-xs text-slate-300 mb-2">
              Live preview
            </p>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/90 p-3 border border-emerald-500/40">
                <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-1">
                  Text moment
                </p>
                <p className="text-sm text-slate-50">
                  “Amina, you turned our house into a home. This is just a tiny
                  moment to say thank you for your gentle magic 💛”
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-3 border border-amber-400/40">
                <p className="text-[11px] uppercase tracking-wide text-amber-300 mb-1">
                  Kid voice moment
                </p>
                <p className="text-sm text-slate-100 italic">
                  “Hi Dad… it&apos;s me. Thank you for always coming back home
                  smiling. I&apos;m so proud you&apos;re my hero.”
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/90 p-3 border border-pink-400/40">
                <p className="text-[11px] uppercase tracking-wide text-pink-300 mb-1">
                  Video moment
                </p>
                <p className="text-xs text-slate-300">
                  Imagine this as a short, emotional video you send on WhatsApp
                  — recorded by you or by a playful kid avatar. That&apos;s the
                  RANIA moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}