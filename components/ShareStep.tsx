type Props = {
  receiverName: string;
  momentLink: string | null;
  sendMode: "free" | "premium" | null;
  finalPrice: number | null;
};

export default function ShareStep({
  receiverName,
  momentLink,
  sendMode,
  finalPrice,
}: Props) {
  return (
    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/70 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        Step 5 of 5 — Share your moment
      </p>
      <h2 className="text-xl font-semibold text-slate-50">
        Your moment is ready to send! 🎉
      </h2>
      <p className="text-slate-300 text-sm">
        {receiverName
          ? `This moment is now waiting for ${receiverName}.`
          : "This moment is ready for your person."}{" "}
        You can drop it straight into WhatsApp, Telegram, SMS — whatever you
        both use.
      </p>

      {sendMode && (
        <p className="text-xs text-slate-400">
          You sent this as a{" "}
          <span className="font-semibold text-emerald-300">
            {sendMode === "free" ? "free" : "premium"}
          </span>{" "}
          moment
          {sendMode === "premium" && finalPrice !== null
            ? ` (KES ${finalPrice})`
            : ""}{" "}
          .
        </p>
      )}

      <div className="rounded-2xl bg-slate-950/80 border border-slate-700 p-3 space-y-2">
        <p className="text-[11px] text-slate-400">Moment link</p>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            readOnly
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-200"
            value={momentLink || "Link will appear here once saved."}
          />
          <button
            type="button"
            className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700"
            onClick={() => {
              if (momentLink && navigator.clipboard) {
                navigator.clipboard.writeText(
                  window.location.origin + momentLink
                );
              }
            }}
          >
            Copy moment link
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          className="flex-1 rounded-full bg-emerald-500 text-slate-950 text-sm font-medium py-2 hover:bg-emerald-400"
        >
          Send on WhatsApp
        </button>
        <button
          type="button"
          className="flex-1 rounded-full border border-slate-700 text-slate-100 text-sm py-2 hover:bg-slate-800"
        >
          Download (coming soon)
        </button>
      </div>
    </div>
  );
}