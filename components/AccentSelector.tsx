"use client";

import React from "react";
import { JSX } from "react/jsx-dev-runtime";

export type AccentKey = "en_us_youth" | "en_ke" | "sw_tz";
export type VoiceGender = "male" | "female";

export interface AccentSelectorProps {
  accent: AccentKey;
  gender: VoiceGender;
  onAccentChange: (accent: AccentKey) => void;
  onGenderChange: (gender: VoiceGender) => void;
}

const ACCENT_LABELS: Record<AccentKey, string> = {
  en_us_youth: "American Youth",
  en_ke: "Kenyan English",
  sw_tz: "Tanzanian Swahili",
};

export default function AccentSelector({
  accent,
  gender,
  onAccentChange,
  onGenderChange,
}: AccentSelectorProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
      <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
        Voice accent & gender
      </p>
      <p className="text-[11px] text-slate-400">
        Choose how the talking photo should sound. For V1 we support American
        youth, Kenyan English, and Tanzanian Swahili — male or female tone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Accent profile
          </label>
          <select
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            value={accent}
            onChange={(e) => onAccentChange(e.target.value as AccentKey)}
          >
            {Object.entries(ACCENT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Voice gender
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onGenderChange("female")}
              className={`flex-1 rounded-full px-3 py-2 text-xs border ${
                gender === "female"
                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400/70"
              }`}
            >
              Female
            </button>
            <button
              type="button"
              onClick={() => onGenderChange("male")}
              className={`flex-1 rounded-full px-3 py-2 text-xs border ${
                gender === "male"
                  ? "border-emerald-400 bg-emerald-500 text-slate-950"
                  : "border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400/70"
              }`}
            >
              Male
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}