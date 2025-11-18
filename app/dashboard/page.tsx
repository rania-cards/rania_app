// import DashboardSummary from "@/components/DashboardSummary";

import DashboardSummary from "@/components/DashboardSummary/page";
import DiscountBanner from "@/components/DiscountBanner/page";
import ReferralPanel from "@/components/ReferralPanel/page";

// import ReferralPanel from "@/components/ReferralPanel";

export default function DashboardPage() {
  return (
    <div className="px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your RANIA space ✨</h1>
          <p className="text-slate-300 text-sm">
            Here you&apos;ll see your moments, referral progress, discounts, and
            free premium moment balance.
          </p>
        </div>

        <DiscountBanner />

        <div className="grid gap-6 lg:grid-cols-[2fr,1.1fr]">
          <DashboardSummary/>
          <ReferralPanel />
        </div>
      </div>
    </div>
  );
}