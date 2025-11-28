"use client";

import { Loader, Sparkles } from "lucide-react";

interface Step3TextFreeProps {
  finalMessage: string;
  isProcessing: boolean;
  onCreate: () => void;
  onBack: () => void;
}

export const Step3TextFree: React.FC<Step3TextFreeProps> = ({
  finalMessage,
  isProcessing,
  onCreate,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8">
        <p className="text-center text-2xl leading-relaxed text-slate-50 font-semibold">
          &quot;{finalMessage}&quot;
        </p>
      </div>

      <button
        onClick={onCreate}
        disabled={isProcessing}
        className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Create Text Moment — FREE ✨
          </>
        )}
      </button>

      <button
        onClick={onBack}
        className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
      >
        ← Back
      </button>
    </div>
  );
};