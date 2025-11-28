"use client";

import { Sparkles } from "lucide-react";

type DeliveryFormat = "text" | "still" | "gif";

interface Step2FormatSelectorProps {
  finalMessage: string;
  onSelectFormat: (format: DeliveryFormat) => void;
  onBack: () => void;
}

export const Step2FormatSelector: React.FC<Step2FormatSelectorProps> = ({
  finalMessage,
  onSelectFormat,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8">
        <p className="text-center text-2xl leading-relaxed text-slate-50 font-semibold">
          &quot;{finalMessage}&quot;
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200">
          How would you like to share it?
        </h3>

        <button
          onClick={() => onSelectFormat("text")}
          className="w-full p-6 rounded-xl border-2 border-emerald-500/50 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left group"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-emerald-400 mb-1 text-lg">
                📝 Text Moment
              </h4>
              <p className="text-sm text-slate-300">
                Clean text card, perfect for sharing
              </p>
            </div>
            <span className="font-bold text-emerald-400 text-lg group-hover:scale-110 transition">
              FREE
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelectFormat("still")}
          className="w-full p-6 rounded-xl border-2 border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition text-left group"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-indigo-400 mb-1 text-lg">
                🖼️ Spotlight Poster
              </h4>
              <p className="text-sm text-slate-300">
                Premium poster-style image with your message
              </p>
            </div>
            <span className="font-bold text-indigo-400 text-lg group-hover:scale-110 transition">
              KES 50
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelectFormat("gif")}
          className="w-full p-6 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition text-left group"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-purple-400 mb-1 text-lg">
                🎬 Status Trio
              </h4>
              <p className="text-sm text-slate-300">
                Animated status-style visual using trending GIFs (Tenor)
              </p>
            </div>
            <span className="font-bold text-purple-400 text-lg group-hover:scale-110 transition">
              KES 100
            </span>
          </div>
        </button>
      </div>

      <button
        onClick={onBack}
        className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition"
      >
        ← Back to Edit
      </button>
    </div>
  );
};