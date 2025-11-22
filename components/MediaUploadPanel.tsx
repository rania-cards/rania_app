/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";

type MediaKind = "audio" | "video" | "image";

interface MediaUploadPanelProps {
  kind: MediaKind;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function MediaUploadPanel({
  kind,
  file,
  onFileChange,
}: MediaUploadPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const label =
  kind === "audio" ? "voice" : kind === "image" ? "photo" : "video";
 const accept =
  kind === "audio" ? "audio/*" : kind === "image" ? "image/*" : "video/*"
  

  return (
    <div className="mt-4 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <p className="text-xs text-slate-300">
        {kind === "audio"
          ? "Add your voice (optional)"
          : "Add your video (optional)"}
      </p>
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <label className="inline-flex items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-100 hover:bg-slate-700 cursor-pointer">
          <span>Choose {label} file</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onFileChange(f);
            }}
          />
        </label>

        {file && (
          <p className="text-[11px] text-slate-400 truncate">
            Selected: <span className="text-slate-200">{file.name}</span>
          </p>
        )}
      </div>

      {previewUrl && kind === "audio" && (
        <audio controls className="w-full mt-2" src={previewUrl} />
      )}

      {previewUrl && kind === "video" && (
        <video
          controls
          className="w-full mt-2 rounded-lg border border-slate-700"
          src={previewUrl}
        />
      )}
<p className="text-[11px] text-slate-500">
  In this version we’re just previewing your file. In the next steps
  we’ll upload it securely and attach it to your moment.
</p>
<p className="text-[11px] text-slate-500">
  Your {label} is previewed here and securely uploaded to attach to this moment.
</p>
    </div>
  );
}