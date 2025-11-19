/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

type MediaKind = "audio" | "video";

export interface MediaUploadPanelProps {
  kind: MediaKind;
  userId: string;
  onUploaded: (url: string) => void;
}

export default function MediaUploadPanel({
  kind,
  userId,
  onUploaded,
}: MediaUploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const label = kind === "audio" ? "voice" : "video";
  const endpoint =
    kind === "audio" ? "/api/media/upload-audio" : "/api/media/upload-video";
  const accept = kind === "audio" ? "audio/*" : "video/*";

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[RANIA] media upload failed:", body);
        throw new Error("Upload failed. Please try again.");
      }

      const json = (await res.json()) as { url?: string; error?: string };

      if (!json.url) {
        throw new Error(json.error || "Upload response missing URL.");
      }

      setUploadedUrl(json.url);
      onUploaded(json.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error while uploading.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
      <p className="text-xs text-slate-300">
        {kind === "audio"
          ? "Record or upload your voice so they can hear you."
          : "Upload or record a short video moment they can replay forever."}
      </p>

      <label className="inline-flex items-center rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-100 hover:bg-slate-700 cursor-pointer">
        <span>{uploading ? `Uploading ${label}…` : `Choose ${label} file`}</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {uploadedUrl && (
        <p className="text-[11px] text-emerald-300 break-all">
          {kind === "audio" ? "Voice" : "Video"} saved. We&apos;ll send it with
          this moment.
        </p>
      )}

      {error && (
        <p className="text-[11px] text-rose-400">
          {error}
        </p>
      )}

      <p className="text-[11px] text-slate-500">
        Tip: keep your {label} short (15–30 seconds) so it loads quickly on
        every device.
      </p>
    </div>
  );
}