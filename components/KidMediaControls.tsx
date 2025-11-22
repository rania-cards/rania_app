"use client";

import React, { JSX, useEffect, useState } from "react";
import type { AccentKey, VoiceGender } from "./AccentSelector";

export interface KidMediaControlsProps {
  userId: string;
  momentId: string | null;
  text: string;
  accent: AccentKey;
  gender: VoiceGender;
  deliveryType: "kid_voice" | "kid_video";
  onMediaUrl: (url: string | null) => void;
}

/**
 * Maps an accent + gender selection to a logical Azure voiceKey
 * that the /api/media/kid-voice-azure route understands.
 */
function resolveVoiceKey(accent: AccentKey, gender: VoiceGender): "en_us_youth" | "en_ke" | "sw_tz" {
  // For now, we don't differentiate gender at the backend,
  // but later you can map male/female to different env vars.
  switch (accent) {
    case "en_ke":
      return "en_ke";
    case "sw_tz":
      return "sw_tz";
    case "en_us_youth":
    default:
      return "en_us_youth";
  }
}

interface KidVoiceAzureResponse {
  url?: string;
  voiceKey?: string;
  error?: string;
}

interface KidVideoCreateResponse {
  videoId?: string;
  profileId?: string;
  momentId?: string | null;
  error?: string;
}

interface KidVideoStatusResponse {
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}
export default function KidMediaControls({
  userId,
  momentId,
  text,
  accent,
  gender,
  deliveryType,
  onMediaUrl,
}: KidMediaControlsProps): JSX.Element {
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);

  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<
    KidVideoStatusResponse["status"] | null
  >(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Whenever a new mediaUrl is produced, notify the parent
  useEffect(() => {
    if (deliveryType === "kid_voice") {
      onMediaUrl(voiceUrl);
    } else if (deliveryType === "kid_video") {
      onMediaUrl(videoUrl);
    }
  }, [voiceUrl, videoUrl, deliveryType, onMediaUrl]);

  async function handleGenerateVoice(): Promise<void> {
    setVoiceError(null);
    setVoiceLoading(true);
    setVoiceUrl(null);

    if (!userId.trim()) {
      setVoiceError("Missing userId");
      setVoiceLoading(false);
      return;
    }

    try {
      const voiceKey = resolveVoiceKey(accent, gender);
      const res = await fetch("/api/media/kid-voice-azure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceKey,
          userId: userId.trim(),
          momentId: momentId ?? null,
        }),
      });

      const data = (await res.json()) as KidVoiceAzureResponse;

      if (!res.ok || data.error || !data.url) {
        setVoiceError(data.error ?? "Failed to generate voice.");
        setVoiceLoading(false);
        return;
      }

      setVoiceUrl(data.url);
    } catch (err) {
      console.error("[RANIA] KidMediaControls voice error", err);
      setVoiceError("Unexpected error while generating voice.");
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleStartVideo(): Promise<void> {
    setVideoError(null);
    setVideoLoading(true);
    setVideoId(null);
    setVideoStatus(null);
    setVideoUrl(null);

    if (!userId.trim()) {
      setVideoError("Missing userId");
      setVideoLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/media/kid-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          profileId: "kid_en_us", // for now, we just pick one kid profile; later map accent
          userId: userId.trim(),
          momentId: momentId ?? undefined,
          // photoAvatarId can be omitted to use HEYGEN_DEFAULT_PHOTO_AVATAR_ID
        }),
      });

      const data = (await res.json()) as KidVideoCreateResponse;

      if (!res.ok || data.error || !data.videoId) {
        setVideoError(data.error ?? "Failed to start video job.");
        setVideoLoading(false);
        return;
      }

      setVideoId(data.videoId);
      setVideoStatus("pending");
    } catch (err) {
      console.error("[RANIA] KidMediaControls video error", err);
      setVideoError("Unexpected error while starting video job.");
    } finally {
      setVideoLoading(false);
    }
  }

  // Poll HeyGen video status
  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    async function poll(): Promise<void> {
      try {
        const res = await fetch(
          `/api/media/kid-video/status?videoId=${encodeURIComponent(videoId ?? "")}`
        );
        const data = (await res.json()) as KidVideoStatusResponse | {
          error: string;
        };

        if (!res.ok || "error" in data) {
          if (!cancelled) {
            setVideoError(
              "error" in data ? data.error : "Failed to fetch video status."
            );
            setVideoStatus("failed");
          }
          return;
        }

        if (cancelled) return;

        setVideoStatus(data.status);

        if (data.status === "completed" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          return;
        }

        if (data.status === "failed") {
          setVideoError(data.errorMessage ?? "Video generation failed.");
          return;
        }

        // pending/processing → poll again
        setTimeout(poll, 4000);
      } catch (err) {
        console.error("[RANIA] KidMediaControls poll error", err);
        if (!cancelled) {
          setVideoError("Error while polling video status.");
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-4">
      <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
        Kid media generation
      </p>

      <p className="text-[11px] text-slate-400">
        When you choose kid voice or kid video, use these buttons to generate
        the audio or video preview using Azure TTS + HeyGen. The final URL will
        be saved into the moment when you submit.
      </p>

      {deliveryType === "kid_voice" && (
        <>
          <button
            type="button"
            onClick={handleGenerateVoice}
            disabled={voiceLoading}
            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {voiceLoading ? "Generating kid voice…" : "Generate kid voice audio"}
          </button>

          {voiceError && (
            <p className="text-[11px] text-rose-400 mt-2">{voiceError}</p>
          )}

          {voiceUrl && (
            <div className="space-y-2 mt-3">
              <p className="text-[11px] text-emerald-300">
                Voice generated. This preview uses the Azure voice for the
                selected accent.
              </p>
              <audio controls className="w-full" src={voiceUrl} />
            </div>
          )}
        </>
      )}

      {deliveryType === "kid_video" && (
        <>
          <button
            type="button"
            onClick={handleStartVideo}
            disabled={videoLoading}
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {videoLoading ? "Starting kid video…" : "Generate kid video"}
          </button>

          {videoError && (
            <p className="text-[11px] text-rose-400 mt-2">{videoError}</p>
          )}

          {videoStatus && (
            <p className="text-[11px] text-slate-400 mt-2">
              Video status:{" "}
              <span className="text-emerald-300 font-semibold">
                {videoStatus}
              </span>
            </p>
          )}

          {videoUrl && (
            <div className="space-y-2 mt-3">
              <p className="text-[11px] text-emerald-300">
                Video ready. This is the animated talking photo preview from
                HeyGen.
              </p>
              <video
                controls
                className="w-full max-w-md rounded-2xl border border-slate-700"
                src={videoUrl}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}