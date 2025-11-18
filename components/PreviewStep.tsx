import type { DeliveryType } from "@/types";
import type { TemplateStyle } from "@/lib/templates";

type Props = {
  receiverName: string;
  messageText: string;
  deliveryType: DeliveryType;
  premiumPrice: number;
  activeDiscountLabel: string | null;
  templates: TemplateStyle[];
  selectedTemplateId: string | null;
  onSelectTemplate: (id: string) => void;
  onSendFree: () => void;
  onSendPremium: () => void;
};

export default function PreviewStep({
  receiverName,
  messageText,
  deliveryType,
  premiumPrice,
  activeDiscountLabel,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSendFree,
  onSendPremium,
}: Props) {
  const priceLabel = activeDiscountLabel ?? `KES ${premiumPrice}`;

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const backgroundStyle = selectedTemplate
    ? {
        backgroundImage: `radial-gradient(circle at top left, ${selectedTemplate.gradientFrom}, transparent 55%), radial-gradient(circle at bottom right, ${selectedTemplate.gradientTo}, #020617)`,
      }
    : {};

  return (
    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/70 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        Step 4 of 5 — Preview & paywall
      </p>
      <p className="text-slate-300 text-sm">
        This is how your moment will feel. You can send it for free with a tiny
        watermark, or upgrade to unlock full quality and premium delivery
        styles.
      </p>

      {/* Template selector */}
      <div className="space-y-2">
        <p className="text-xs text-slate-300">Choose a style</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {templates.map((t) => {
            const isActive = t.id === selectedTemplate?.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTemplate(t.id)}
                className={`flex-shrink-0 rounded-2xl border px-3 py-2 text-left text-xs min-w-[130px] ${
                  isActive
                    ? "border-emerald-400 bg-slate-950"
                    : "border-slate-700 bg-slate-950/50 hover:border-emerald-400/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.icon}</span>
                  <span className="font-semibold text-slate-50">
                    {t.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Moment preview card */}
      <div
        className="rounded-3xl p-[1px]"
        style={backgroundStyle}
      >
        <div className="rounded-3xl bg-slate-950/95 p-4 min-h-[180px] flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-slate-200">
                {receiverName || "Your person"}
              </span>
              <span className="text-[10px] text-slate-500">
                {deliveryType === "text"
                  ? "Text moment"
                  : deliveryType === "user_voice"
                  ? "Your voice"
                  : deliveryType === "user_video"
                  ? "Your video"
                  : deliveryType === "kid_voice"
                  ? "Kid voice"
                  : "Kid video"}
              </span>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-800/80 px-3 py-2 max-w-[90%]">
              <p className="text-sm text-slate-50 whitespace-pre-wrap">
                {messageText || "Your moment text will appear here."}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-slate-500 text-center">
            Made with ❤️ on RANIA
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-4">
        <button
          type="button"
          onClick={onSendFree}
          className="w-full rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900"
        >
          Send for FREE (with watermark)
        </button>
        <p className="text-[11px] text-slate-500 text-center">
          Watermark: <span className="italic">Made with ❤️ on RANIA</span>
        </p>

        <button
          type="button"
          onClick={onSendPremium}
          className="w-full rounded-full bg-emerald-500 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-emerald-400"
        >
          Upgrade — {priceLabel}
        </button>
        <p className="text-[11px] text-slate-300 text-center">
          Full quality · No watermark · Unlock video & kid voice styles 💛
        </p>
      </div>
    </div>
  );
}