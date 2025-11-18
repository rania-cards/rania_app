import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Simple pricing for unforgettable moments 💛
        </h1>
        <p className="text-slate-300 mb-10">
          Your first text moments are free with a small watermark. Upgrade any
          moment for full quality, no watermark, and premium delivery styles.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 text-left">
            <h2 className="text-xl font-semibold mb-2">Start for FREE</h2>
            <p className="text-slate-300 text-sm mb-4">
              Create up to 10 text moments with a small “Made with ❤️ on RANIA”
              watermark.
            </p>
            <ul className="space-y-2 text-sm text-slate-200">
              <li>• Text moments only</li>
              <li>• Watermark included</li>
              <li>• Perfect to test the magic</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-emerald-500 bg-slate-900/80 p-6 text-left">
            <h2 className="text-xl font-semibold mb-2">Premium Moment</h2>
            <p className="text-3xl font-bold mb-1">KES 130</p>
            <p className="text-slate-300 text-sm mb-4">
              Per premium moment. No subscription. Just pay when the moment
              truly matters.
            </p>
            <ul className="space-y-2 text-sm text-slate-200 mb-6">
              <li>• No watermark</li>
              <li>• Unlock video & kid voice styles</li>
              <li>• Perfect for big days and deep feelings</li>
            </ul>
            <Link
              href="/create/moment"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
            >
              Start a premium moment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}