/* eslint-disable @typescript-eslint/no-explicit-any */
// components/CustomizationPanel.tsx
"use client";

import { useState } from "react";
import { 
  FONTS, 
  TEXT_COLORS, 
  getAllTemplates, 
  getAllGifPacks,
  FontFamily,
  TextColorId,
  StillTemplateId,
  GifPackId,
} from "@/lib/designSystem";
import { Palette, Type, Zap } from "lucide-react";

interface CustomizationPanelProps {
  selectedFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  selectedTextColor: TextColorId;
  onTextColorChange: (color: TextColorId) => void;
  selectedTemplate?: StillTemplateId;
  selectedGifPack?: GifPackId;
  format: "still" | "gif" | "text";
  onTemplateChange?: (template: StillTemplateId) => void;
  onGifPackChange?: (pack: GifPackId) => void;
}

export function CustomizationPanel({
  selectedFont,
  onFontChange,
  selectedTextColor,
  onTextColorChange,
  selectedTemplate,
  selectedGifPack,
  format,
  onTemplateChange,
  onGifPackChange,
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<"font" | "color" | "style">("font");

  const fontEntries = Object.entries(FONTS) as [FontFamily, any][];
  const colorEntries = Object.entries(TEXT_COLORS) as [TextColorId, any][];

  return (
    <div className="space-y-6 bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab("font")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "font"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500"
              : "text-slate-300 hover:text-slate-100"
          }`}
        >
          <Type className="w-4 h-4" />
          Font
        </button>
        <button
          onClick={() => setActiveTab("color")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === "color"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500"
              : "text-slate-300 hover:text-slate-100"
          }`}
        >
          <Palette className="w-4 h-4" />
          Color
        </button>
        {format !== "text" && (
          <button
            onClick={() => setActiveTab("style")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "style"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500"
                : "text-slate-300 hover:text-slate-100"
            }`}
          >
            <Zap className="w-4 h-4" />
            Style
          </button>
        )}
      </div>

      {/* Font Selection */}
      {activeTab === "font" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">Select Font</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {fontEntries.map(([fontId, font]) => (
              <button
                key={fontId}
                onClick={() => onFontChange(fontId)}
                className={`p-3 rounded-lg border-2 transition text-center ${
                  selectedFont === fontId
                    ? "border-emerald-400 bg-emerald-500/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    selectedFont === fontId ? "text-emerald-400" : "text-slate-300"
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {activeTab === "color" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">Text Color</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {colorEntries.map(([colorId, color]) => (
              <button
                key={colorId}
                onClick={() => onTextColorChange(colorId)}
                className={`p-3 rounded-lg border-2 transition group ${
                  selectedTextColor === colorId
                    ? "border-emerald-400 bg-emerald-500/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                title={color.name}
              >
                <div
                  className="w-full h-8 rounded mb-2 border border-slate-600"
                  style={{ backgroundColor: color.hex }}
                />
                <p
                  className={`text-xs font-semibold ${
                    selectedTextColor === colorId
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-slate-300"
                  }`}
                >
                  {color.name.split(" ")[0]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template/Style Selection */}
      {activeTab === "style" && format === "still" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">Background Style</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {getAllTemplates().map((template) => (
              <button
                key={template.id}
                onClick={() => onTemplateChange?.(template.id)}
                className={`rounded-lg overflow-hidden border-2 transition aspect-[9/16] group ${
                  selectedTemplate === template.id
                    ? "border-emerald-400"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition">
                  <p className="text-white text-xs font-semibold">{template.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "style" && format === "gif" && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-200">GIF Animation Pack</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {getAllGifPacks().map((pack) => (
              <button
                key={pack.id}
                onClick={() => onGifPackChange?.(pack.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedGifPack === pack.id
                    ? "border-purple-400 bg-purple-500/20"
                    : "border-slate-600 hover:border-slate-500"
                }`}
              >
                <h5
                  className={`font-semibold mb-2 ${
                    selectedGifPack === pack.id
                      ? "text-purple-400"
                      : "text-slate-200"
                  }`}
                >
                  {pack.name}
                </h5>
                <div className="flex gap-2">
                  {pack.colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-6 rounded border border-slate-600"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}