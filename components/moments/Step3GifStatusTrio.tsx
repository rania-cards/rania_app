"use client";

import { AlertCircle, Loader, Zap } from "lucide-react";

interface Step3GifStatusTrioProps {
  gifPreviewUrls: string[];
  gifPreviewLoading: boolean;
  selectedGifUrl: string | null;
  setSelectedGifUrl: (url: string | null) => void;
  generatedGifDataUrl: string | null;
  isGeneratingGif: boolean;
  gifGenerationError: string | null;
  onFetchPreviews: () => void;
  onGenerateGif: (gifUrl: string) => Promise<void>;
  isProcessing: boolean;
  onPayAndCreate: () => void;
  onBack: () => void;
}

export const Step3GifStatusTrio: React.FC<Step3GifStatusTrioProps> = ({
  gifPreviewUrls,
  gifPreviewLoading,
  selectedGifUrl,
  setSelectedGifUrl,
  generatedGifDataUrl,
  isGeneratingGif,
  gifGenerationError,
  onFetchPreviews,
  onGenerateGif,
  isProcessing,
  onPayAndCreate,
  onBack,
}) => {
  const handleSelectGif = async (gifUrl: string) => {
    // if already selected and generated, don't re-generate
    if (gifUrl === selectedGifUrl && generatedGifDataUrl) {
      return;
    }

    setSelectedGifUrl(gifUrl);
    try {
      await onGenerateGif(gifUrl);
    } catch {
      // error handled via gifGenerationError
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-200">🌈 Choose Your Status Trio</h3>
      <p className="text-sm text-slate-300">
        Select a GIF that matches your vibe. We&apos;ll combine it with your message.
      </p>

      {gifPreviewLoading && (
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Finding the best GIFs for your message…</span>
        </div>
      )}

      {/* Tenor preview grid (only for selection, not the final card) */}
      {!gifPreviewLoading && gifPreviewUrls.length > 0 && !generatedGifDataUrl && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gifPreviewUrls.map((gifUrl, index) => (
            <button
              key={index}
              onClick={() => handleSelectGif(gifUrl)}
              className="relative rounded-2xl overflow-hidden border-2 border-slate-600 hover:border-purple-400 transition group aspect-square"
              disabled={isGeneratingGif}
            >
              <img
                src={gifUrl}
                alt={`GIF option ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-3">
                <p className="text-white text-sm font-bold">
                  {isGeneratingGif && gifUrl === selectedGifUrl
                    ? "Generating..."
                    : "Select"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading state while generating complete card */}
      {isGeneratingGif && (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-purple-500/20 border border-purple-500/50 gap-4">
          <Loader className="w-8 h-8 animate-spin text-purple-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-purple-300">
              Generating your complete Status Trio card…
            </p>
            <p className="text-xs text-purple-200 mt-1">
              Rendering the GIF with your message, this may take some seconds
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {gifGenerationError && !isGeneratingGif && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Generation failed</p>
            <p className="text-xs text-red-200 mt-1">{gifGenerationError}</p>
            <button
              onClick={() => {
                setSelectedGifUrl(null);
              }}
              className="text-xs text-red-300 underline mt-2 hover:text-red-200"
            >
              Try a different GIF
            </button>
          </div>
        </div>
      )}

      {/* Preview of complete generated card */}
      {generatedGifDataUrl && !isGeneratingGif && (
        <div className="space-y-6">
          <h4 className="font-semibold text-slate-300 text-center">
            ✨ Your complete Status Trio card (ready to share):
          </h4>

          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-2xl">
              <img
                src={generatedGifDataUrl}
                alt="Generated Status Trio GIF"
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSelectedGifUrl(null);
              }}
              className="w-full py-2 text-slate-300 hover:text-slate-100 transition text-sm border border-slate-600 rounded-lg"
            >
              ← Choose Different GIF
            </button>

            <button
              onClick={onPayAndCreate}
              disabled={isProcessing}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Create & Pay — KES 100
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* No GIFs found */}
      {!gifPreviewLoading && gifPreviewUrls.length === 0 && !generatedGifDataUrl && (
        <div className="text-sm text-slate-400 text-center">
          No GIFs found yet.{" "}
          <button
            type="button"
            onClick={onFetchPreviews}
            className="text-emerald-400 underline underline-offset-2"
          >
            Try again
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