"use client";

import { Loader } from "lucide-react";

type DeliveryFormat = "text" | "still" | "gif" | null;

interface ProcessingOverlayProps {
  selectedFormat: DeliveryFormat;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  selectedFormat,
}) => {
  const message =
    selectedFormat === "gif"
      ? "Generating your Status Trio…"
      : selectedFormat === "still"
      ? "Creating your Spotlight Poster…"
      : "Creating your text moment…";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl">
        <Loader className="w-6 h-6 animate-spin text-emerald-400" />
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-100">{message}</p>
          <p className="text-xs text-slate-400">
            This may take a few seconds. Please don&apos;t close this page.
          </p>
        </div>
      </div>
    </div>
  );
};