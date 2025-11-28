"use client";

import { ChangeEvent } from "react";
import { CheckCircle, Loader, Zap } from "lucide-react";
import { getAllTemplates, StillTemplateId } from "@/lib/moments/templates";

interface Step3StillSpotlightProps {
  selectedTemplate: StillTemplateId | null;
  onSelectTemplate: (id: StillTemplateId) => void;
  preview: string | null;
  onUploadFile: (file: File) => void;
  isProcessing: boolean;
  onPayAndCreate: () => void;
  onBack: () => void;
}

export const Step3StillSpotlight: React.FC<Step3StillSpotlightProps> = ({
  selectedTemplate,
  onSelectTemplate,
  preview,
  onUploadFile,
  isProcessing,
  onPayAndCreate,
  onBack,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-200">
        🎨 Choose Your Spotlight Poster Background
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {getAllTemplates()
          .filter((t) => !t.isUpload)
          .map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`rounded-xl overflow-hidden border-2 transition aspect-[9/16] group relative ${
                selectedTemplate === template.id
                  ? "border-emerald-400 scale-105"
                  : "border-slate-600 hover:border-emerald-400"
              }`}
            >
              <img
                src={template.imageUrl}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <p className="text-white font-semibold text-sm">
                  {template.name}
                </p>
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-400/10 border-2 border-emerald-400">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
              )}
            </button>
          ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200">
          Or upload your own photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-200"
        />
      </div>

      {selectedTemplate && preview && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-300">Preview:</h4>
          <div className="rounded-xl overflow-hidden border border-emerald-500/50 max-w-sm mx-auto">
            <img src={preview} alt="Preview" className="w-full h-auto" />
          </div>

          <button
            onClick={onPayAndCreate}
            disabled={isProcessing}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Create & Pay — KES 50
              </>
            )}
          </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
      >
        ← Back
      </button>
    </div>
  );
};