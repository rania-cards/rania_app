export default function ReferralPanel() {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h2 className="text-sm font-semibold mb-1">
        Invite friends, earn premium moments 🎁
      </h2>
      <p className="text-xs text-slate-300 mb-3">
        For every 3 friends who send their first moment, you earn 1 free premium
        moment you can use instead of paying KES 130.
      </p>
      <div className="rounded-xl bg-slate-950/60 border border-dashed border-slate-600 p-3">
        <p className="text-[11px] text-slate-400 mb-1">Your referral code</p>
        <p className="font-mono text-xs text-emerald-300">RANIA-XXXXXX</p>
      </div>
    </aside>
  );
}