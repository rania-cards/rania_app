export default function DiscountBanner() {
  return (
    <div className="rounded-2xl border border-amber-400/70 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <span className="font-semibold">No active discounts yet.</span>{" "}
      Soon this will show limited-time KES 50 offers when a moment is abandoned
      or when a receiver starts but doesn&apos;t finish.
    </div>
  );
}