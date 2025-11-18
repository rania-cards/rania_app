import type { DeliveryType } from "@/types";

type Props = {
  selected: DeliveryType;
  basePrice: number;
  activeDiscountLabel: string | null;
  onSelectDelivery: (type: DeliveryType) => void;
};

const OPTIONS: { type: DeliveryType; title: string; description: string }[] = [
  {
    type: "text",
    title: "Text",
    description: "Simple, heartfelt message in a chat-style layout.",
  },
  {
    type: "user_voice",
    title: "Your Voice",
    description: "Record or upload your voice so they hear you.",
  },
  {
    type: "user_video",
    title: "Your Video",
    description: "A short video moment they can replay forever.",
  },
  {
    type: "kid_voice",
    title: "Kid Voice",
    description: "A playful kid-style voice delivering your words.",
  },
  {
    type: "kid_video",
    title: "Kid Video",
    description: "A cute kid avatar saying your message in video.",
  },
];

export default function DeliveryStylesStep({
  selected,
  basePrice,
  activeDiscountLabel,
  onSelectDelivery,
}: Props) {
  return (
    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/70 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        Step 3 of 5 — How should we deliver your moment?
      </p>
      <p className="text-slate-300 text-sm">
        Choose how this moment should arrive. You can always start with text and
        upgrade later.
      </p>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Premium moment price:</span>
        <span className="font-medium text-emerald-300">
          {activeDiscountLabel ? activeDiscountLabel : `KES ${basePrice}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {OPTIONS.map((opt) => {
          const isLocked =
            opt.type === "user_video" || opt.type === "kid_video";
          const isSelected = opt.type === selected;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelectDelivery(opt.type)}
              className={`text-left rounded-2xl border px-3 py-3 text-sm transition ${
                isSelected
                  ? "border-emerald-400 bg-slate-950"
                  : "border-slate-700 bg-slate-950/50 hover:border-emerald-400/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-50">
                  {opt.title}
                </span>
                {isLocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/60">
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}