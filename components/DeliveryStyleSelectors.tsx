

export type DeliveryType = "text" | "user_voice" | "user_video";

interface DeliveryStyleSelectorProps {
  value: DeliveryType;
  onChange: (value: DeliveryType) => void;
}

export default function DeliveryStyleSelector({
  value,
  onChange,
}: DeliveryStyleSelectorProps) {
  const styles: { key: DeliveryType; label: string; desc: string; tag: string }[] = [
    {
      key: "text",
      label: "Text / GIF",
      desc: "Simple text card or GIF moment.",
      tag: "Free",
    },

    {
      key: "user_video",
      label: "Your video",
      desc: "Short video message they can replay.",
      tag: "Premium",
    },
  ];

  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs text-slate-300">Choose delivery style</p>
      <div className="grid md:grid-cols-3 gap-3">
        {styles.map((item) => {
          const isActive = value === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`text-left rounded-2xl border p-3 text-xs space-y-1 transition ${
                isActive
                  ? "border-emerald-400 bg-slate-900/80"
                  : "border-slate-700 bg-slate-950 hover:border-emerald-400/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-50">
                  {item.label}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    item.tag === "Free"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-fuchsia-500/10 text-fuchsia-200"
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}