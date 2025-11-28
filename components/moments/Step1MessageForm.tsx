"use client";

import { Loader, Sparkles } from "lucide-react";

type Gender = "none" | "male" | "female";

interface Step1MessageFormProps {
  receiverName: string;
  setReceiverName: (v: string) => void;
  senderName: string;
  setSenderName: (v: string) => void;
  occasion: string;
  setOccasion: (v: string) => void;
  relationship: string;
  setRelationship: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  gender: Gender;
  setGender: (g: Gender) => void;
  userMessage: string;
  setUserMessage: (v: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const Step1MessageForm: React.FC<Step1MessageFormProps> = ({
  receiverName,
  setReceiverName,
  senderName,
  setSenderName,
  occasion,
  setOccasion,
  relationship,
  setRelationship,
  tone,
  setTone,
  gender,
  setGender,
  userMessage,
  setUserMessage,
  isGenerating,
  onGenerate,
}) => {
  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            🎯 Who are you writing to?
          </label>
          <input
            type="text"
            placeholder="e.g., Mom, Sarah, Best Friend..."
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            🔤 Your name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g., John..."
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            📅 Occasion
          </label>
          <input
            type="text"
            placeholder="e.g., Birthday, Anniversary..."
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            💝 Relationship
          </label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
          >
            <option value="">Select...</option>
            <option value="family">👨‍👩‍👧 Family</option>
            <option value="friend">🤝 Friend</option>
            <option value="partner">💕 Partner</option>
            <option value="colleague">💼 Colleague</option>
            <option value="mentor">🎓 Mentor</option>
            <option value="other">✨ Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-2">
            ⚧ Gender (affects wording)
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
          >
            <option value="none">Prefer not to specify</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          🎭 Tone/Vibe
        </label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
        >
          <option value="warm">🔥 Warm & Genuine</option>
          <option value="funny">😂 Funny & Light</option>
          <option value="sincere">💭 Sincere & Deep</option>
          <option value="playful">🎪 Playful & Teasing</option>
          <option value="professional">💼 Professional</option>
          <option value="romantic">💕 Romantic</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          💬 What do you want to say?
        </label>
        <textarea
          placeholder="Share what's on your heart... Be authentic!"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          maxLength={500}
          className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition min-h-[150px] resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            {userMessage.length}/500 characters
          </p>
          {userMessage.length > 450 && (
            <p className="text-xs text-amber-400">
              Keep it concise for best results!
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !userMessage.trim()}
        className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Polishing with Rania...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Polish with Rania✨
          </>
        )}
      </button>
    </div>
  );
};