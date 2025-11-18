type Props = {
  vibe: string;
  userMessage: string;
  extraDetails: string;
  generatedText: string;
  isGenerating: boolean;
  onChangeVibe: (v: string) => void;
  onChangeUserMessage: (v: string) => void;
  onChangeExtraDetails: (v: string) => void;
  onChangeGeneratedText: (v: string) => void;
  onGenerate: () => void;
};

const VIBES = ["Sweet", "Funny", "Deep", "Short & Cute", "Romantic", "Heartfelt"];

export default function AiMessageStep({
  vibe,
  userMessage,
  extraDetails,
  generatedText,
  isGenerating,
  onChangeVibe,
  onChangeUserMessage,
  onChangeExtraDetails,
  onChangeGeneratedText,
  onGenerate,
}: Props) {
  return (
    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/70 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        Step 2 of 5 — Craft the message
      </p>
      <p className="text-slate-300 text-sm">
        Now we cook the magic 😍 Tell me a little more and RANIA will turn it
        into a moment that sounds like you.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Choose a vibe
          </label>
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChangeVibe(v)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  v === vibe
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-slate-950/60 text-slate-200 border-slate-700 hover:border-emerald-400/60"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">
            What would you like to tell them?
          </label>
          <textarea
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 min-h-[80px]"
            placeholder="Write a short note in your own words..."
            value={userMessage}
            onChange={(e) => onChangeUserMessage(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Anything personal I should add? (optional)
          </label>
          <textarea
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 min-h-[60px]"
            placeholder="Inside jokes, memories, names, tiny details..."
            value={extraDetails}
            onChange={(e) => onChangeExtraDetails(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            The more specific the details, the more the moment will feel like it
            came straight from your heart.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-full bg-emerald-500 text-slate-950 text-sm font-medium px-5 py-2 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
        >
          {isGenerating ? "Cooking your moment..." : "Generate my moment ✨"}
        </button>

        {generatedText && (
          <div className="mt-3 rounded-2xl bg-slate-950/80 border border-emerald-500/40 p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-emerald-300">AI-crafted moment</p>
              <button
                type="button"
                onClick={onGenerate}
                className="text-[11px] text-emerald-300 hover:underline"
              >
                Regenerate
              </button>
            </div>
            <textarea
              className="w-full bg-transparent text-sm text-slate-50 outline-none border-none resize-none min-h-[80px]"
              value={generatedText}
              onChange={(e) => onChangeGeneratedText(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}