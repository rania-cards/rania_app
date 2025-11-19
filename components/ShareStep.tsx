"use client";

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
  const fullUrl =
    typeof window !== "undefined" && momentLink
      ? `${window.location.origin}${momentLink}`
      : momentLink ?? "";

  const labelReceiver = receiverName || "someone special";

  const summaryLine =
    sendMode === "premium"
      ? `I just sent you a premium RANIA moment 💛`
      : `I just created a RANIA moment for you 💛`;

  const priceLine =
    sendMode === "premium" && finalPrice !== null
      ? `I even unlocked the premium version (KES ${finalPrice}).`
      : "";

  const defaultText = `${summaryLine} ${priceLine} Open it here: ${fullUrl || "[link will follow]"} `;

  function handleSendWhatsApp() {
    if (!fullUrl) {
      alert(
        "The moment link is not ready yet. Please try sending again in a few seconds."
      );
      return;
    }

    const text = `Hi ${labelReceiver},\n\n${summaryLine}\n${priceLine}\n\nOpen your moment here:\n${fullUrl}\n\nMade with ❤️ on RANIA.`;

    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/?text=${encoded}`;

    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  }

  function handleDownload() {
    const textLines = [
      `RANIA moment for ${labelReceiver}`,
      "",
      summaryLine,
      priceLine,
      "",
      fullUrl ? `Moment link: ${fullUrl}` : "Moment link: (not available yet)",
      "",
      "Made with ❤️ on RANIA",
    ];

    const content = textLines.filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `rania-moment-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopyLink() {
    if (!fullUrl) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl).catch((err) => {
        console.error("Clipboard error", err);
      });
    }
  }

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
        Drop it straight into WhatsApp or save it for later.
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
            value={fullUrl || "Link will appear here once saved."}
          />
          <button
            type="button"
            className="rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700"
            onClick={handleCopyLink}
            disabled={!fullUrl}
          >
            Copy moment link
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          className="flex-1 rounded-full bg-emerald-500 text-slate-950 text-sm font-medium py-2 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
          onClick={handleSendWhatsApp}
          disabled={!fullUrl}
        >
          Send on WhatsApp
        </button>
        <button
          type="button"
          className="flex-1 rounded-full border border-slate-700 text-slate-100 text-sm py-2 hover:bg-slate-800"
          onClick={handleDownload}
        >
          Download (.txt)
        </button>
      </div>
    </div>
  );
}