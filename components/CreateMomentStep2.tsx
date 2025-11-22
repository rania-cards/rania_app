/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import MediaUploadPanel from "@/components/MediaUploadPanel";
import { uploadMomentMedia } from "@/lib/uploadMedia";

type Step2Props = {
  momentId: string;          // already created in Step 1 or backend
  userOrGuestId: string;     // guestId or user.id
  onNext: () => void;        // go to Step 3
};

export default function CreateMomentStep2({
  momentId,
  userOrGuestId,
  onNext,
}: Step2Props) {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVoiceChange(file: File | null) {
    setVoiceFile(file);
    if (!file) {
      setVoiceUrl(null);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await uploadMomentMedia(file, momentId, userOrGuestId);
      setVoiceUrl(url);
      // optionally: tell backend this is user_voice delivery
      // or store url in parent moment state
    } catch (err: any) {
      setError(err.message || "Failed to upload voice");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleVideoChange(file: File | null) {
    setVideoFile(file);
    if (!file) {
      setVideoUrl(null);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await uploadMomentMedia(file, momentId, userOrGuestId);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  }

  function handleNextClick() {
    // you can enforce upload completion here if needed
    onNext();
  }

  return (
    <div className="space-y-4">
      {/* Other Step 2 fields: AI-polished text, delivery style selector, etc. */}

      <MediaUploadPanel
        kind="audio"
        file={voiceFile}
        onFileChange={handleVoiceChange}
      />

      <MediaUploadPanel
        kind="video"
        file={videoFile}
        onFileChange={handleVideoChange}
      />

      {isUploading && (
        <p className="text-xs text-slate-400">Uploading media… please wait.</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <button
        disabled={isUploading}
        onClick={handleNextClick}
        className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
      >
        Continue to preview
      </button>
    </div>
  );
}