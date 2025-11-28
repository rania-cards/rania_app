"use client";

import { Copy, Download, Share2 } from "lucide-react";

interface Step4SuccessShareProps {
  successMessage: string;
  preview: string | null;
  shareUrl: string;
  mediaUrl: string | null;
  momentId: string | null;
  onShareWhatsApp: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onViewOnline: () => void;
  onCreateAnother: () => void;
}

export const Step4SuccessShare: React.FC<Step4SuccessShareProps> = ({
  successMessage,
  preview,
  shareUrl,
  mediaUrl,
  momentId,
  onShareWhatsApp,
  onDownload,
  onCopyLink,
  onViewOnline,
  onCreateAnother,
}) => {
  return (
    <div className="space-y-6 bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8 text-center">
      <div className="text-7xl animate-bounce">🎉</div>
      <div>
        <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-purple-400 mb-2">
          Moment Created!
        </h2>
        <p className="text-slate-300">{successMessage}</p>
      </div>

      {preview && (
        <div className="rounded-xl overflow-hidden border border-emerald-500/50 max-w-sm mx-auto">
          <img src={preview} alt="Your moment" className="w-full h-auto" />
        </div>
      )}

      {/* Share URL */}
      <div className="bg-slate-950/80 rounded-lg p-4 flex items-center justify-between border border-slate-600 backdrop-blur">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 bg-transparent text-sm text-slate-300 outline-none truncate font-mono"
        />
        <button
          onClick={onCopyLink}
          className="ml-2 p-2 hover:bg-slate-800 rounded transition flex-shrink-0 hover:text-emerald-400"
          title="Copy link"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onShareWhatsApp}
          className="py-3 rounded-lg bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span> WhatsApp
        </button>
        <button
          onClick={onDownload}
          disabled={!mediaUrl && !momentId}
          className="py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* View Online */}
      <button
        onClick={onViewOnline}
        className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold transition border border-slate-600"
      >
        👁️ View Online
      </button>

      {/* Create Another */}
      <button
        onClick={onCreateAnother}
        className="w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-400 font-bold hover:bg-emerald-500/20 transition"
      >
        ✨ Create Another Moment
      </button>
    </div>
  );
};