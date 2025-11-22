// ---- FULL CODE ----

"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { KidVoiceProfileId } from "@/types";
import { KID_VOICE_PROFILES } from "@/lib/kidVoices";
import { JSX } from "react/jsx-dev-runtime";

type KidVoiceApiSuccess = {
  url: string;
  profileId: KidVoiceProfileId;
};

type KidVoiceApiError = {
  error: string;
};

type KidVoiceApiResponse = KidVoiceApiSuccess | KidVoiceApiError;

type KidVideoStatus = {
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
};

export default function KidStudioPage(): JSX.Element {
  const [userId, setUserId] = useState<string>("");
  const [momentId, setMomentId] = useState<string>("");

  const [text, setText] = useState<string>(
    "Daddy, we miss you so much! Please come home safe. 💛"
  );

  const [selectedProfileId, setSelectedProfileId] =
    useState<KidVoiceProfileId>("kid_en_us");

  // Kid voice state
  const [voiceLoading, setVoiceLoading] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);

  // Kid video state
  const [videoLoading, setVideoLoading] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<
    KidVideoStatus["status"] | null
  >(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const accentOptions = useMemo(
    () =>
      (Object.values(KID_VOICE_PROFILES) ?? []).map((profile) => ({
        id: profile.id,
        label: profile.label,
        description: profile.description,
      })),
    []
  );

  async function handleGenerateKidVoice(): Promise<void> {
    setVoiceError(null);
    setVoiceLoading(true);
    setVoiceUrl(null);

    if (!userId.trim()) {
      setVoiceLoading(false);
      setVoiceError("Please enter a userId (can be a demo id).");
      return;
    }

    try {
      const res = await fetch("/api/media/kid-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          profileId: selectedProfileId,
          userId: userId.trim(),
          momentId: momentId.trim() || null,
        }),
      });

      const data = (await res.json()) as KidVoiceApiResponse;

      if (!res.ok || "error" in data) {
        const msg = "error" in data ? data.error : "Unknown error";
        setVoiceError(msg);
        setVoiceLoading(false);
        return;
      }

      setVoiceUrl(data.url);
    } catch (err) {
      console.error("[KidStudio] kid-voice error", err);
      setVoiceError("Unexpected error while generating kid voice.");
    } finally {
      setVoiceLoading(false);
    }
  }

  async function handleStartKidVideo(): Promise<void> {
    setVideoError(null);
    setVideoLoading(true);
    setVideoId(null);
    setVideoStatus(null);
    setVideoUrl(null);
    setThumbnailUrl(null);

    if (!userId.trim()) {
      setVideoLoading(false);
      setVideoError("Please enter a userId (can be a demo id).");
      return;
    }

    try {
      const res = await fetch("/api/media/kid-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          profileId: selectedProfileId,
          userId: userId.trim(),
          momentId: momentId.trim() || null,
        }),
      });

      const data = (await res.json()) as
        | { videoId: string; profileId: KidVoiceProfileId; momentId: string | null }
        | { error: string };

      if (!res.ok || "error" in data) {
        const msg = "error" in data ? data.error : "Unknown error";
        setVideoError(msg);
        setVideoLoading(false);
        return;
      }

      setVideoId(data.videoId);
      setVideoStatus("pending");
    } catch (err) {
      console.error("[KidStudio] kid-video error", err);
      setVideoError("Unexpected error while starting kid video job.");
    } finally {
      setVideoLoading(false);
    }
  }

  // Poll HeyGen video status when videoId is present
  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    async function pollStatus(): Promise<void> {
      try {
        const res = await fetch(
          // FIX APPLIED HERE
          `/api/media/kid-video/status?videoId=${encodeURIComponent(videoId ?? "")}`
        );

        const data = (await res.json()) as KidVideoStatus | { error: string };

        if (!res.ok || "error" in data) {
          const msg = "error" in data ? data.error : "Unknown error";
          if (!cancelled) {
            setVideoError(msg);
            setVideoStatus("failed");
          }
          return;
        }

        if (cancelled) return;

        setVideoStatus(data.status);
        if (data.thumbnailUrl) {
          setThumbnailUrl(data.thumbnailUrl);
        }

        if (data.status === "completed" && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          return;
        }

        if (data.status === "failed") {
          setVideoError(data.errorMessage ?? "Video generation failed.");
          return;
        }

        setTimeout(pollStatus, 4000);
      } catch (err) {
        console.error("[KidStudio] polling kid video status error", err);
        if (!cancelled) {
          setVideoError("Error while polling video status.");
        }
      }
    }

    pollStatus();

    return () => {
      cancelled = true;
    };
  }, [videoId]);   

  return (
    <div className="px-4 py-10 min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            RANIA · Kid Studio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">
            Kid voice & video playground ✨
          </h1>
          <p className="text-sm text-slate-300">
            Use this page to test kid voices and kid videos (from photo avatars)
            using the ElevenLabs + HeyGen backend we wired. Once you&apos;re
            happy, we&apos;ll embed this logic inside the main moment wizard.
          </p>
        </header>

        {/* User + Moment metadata */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <h2 className="text-sm font-semibold">Step 0 — Context</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                User ID <span className="text-rose-400">*</span>
              </label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="demo-user-id-123 or real Supabase user id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                Moment ID (optional)
              </label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="Optional, used for linking media to a moment"
                value={momentId}
                onChange={(e) => setMomentId(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            For now, you can paste any valid user id (or demo id you&apos;re
            using). Later, this page won&apos;t be needed — it&apos;ll be
            embedded directly into RANIA&apos;s moment creation flow.
          </p>
        </section>

        {/* Text input + accent selection */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            Step 1 — Message & kid accent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr] gap-4">
            <div className="space-y-2">
              <label className="block text-xs text-slate-300 mb-1">
                Moment text
              </label>
              <textarea
                className="w-full min-h-[110px] rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                This is the message the kid voice/video will speak. In the real
                flow, this will come from the AI-crafted moment text.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-slate-300 mb-1">
                Kid accent profile
              </label>
              <select
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                value={selectedProfileId}
                onChange={(e) =>
                  setSelectedProfileId(e.target.value as KidVoiceProfileId)
                }
              >
                {accentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {
                  accentOptions.find((o) => o.id === selectedProfileId)
                    ?.description
                }
              </p>
            </div>
          </div>
        </section>

        {/* Kid voice section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            Step 2 — Generate kid voice (audio)
          </h2>
          <p className="text-xs text-slate-300">
            This calls <code>/api/media/kid-voice</code>, which uses ElevenLabs
            and uploads the result to Supabase <code>moment-audio</code>.
          </p>

          <button
            type="button"
            onClick={handleGenerateKidVoice}
            disabled={voiceLoading}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {voiceLoading ? "Generating kid voice…" : "Generate kid voice audio"}
          </button>

          {voiceError && (
            <p className="text-[11px] text-rose-400 mt-2">{voiceError}</p>
          )}

          {voiceUrl && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-emerald-300">
                Kid voice generated. This is the public audio URL:
              </p>
              <p className="text-[11px] text-slate-300 break-all">{voiceUrl}</p>
              <audio
                controls
                className="w-full mt-2"
                src={voiceUrl}
              />
            </div>
          )}
        </section>

        {/* Kid video section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
          <h2 className="text-sm font-semibold">
            Step 3 — Generate kid video (photo avatar)
          </h2>
          <p className="text-xs text-slate-300">
            This calls <code>/api/media/kid-video</code> to start a HeyGen job,
            then polls <code>/api/media/kid-video/status</code> until the video
            is ready.
          </p>

          <button
            type="button"
            onClick={handleStartKidVideo}
            disabled={videoLoading}
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {videoLoading ? "Starting kid video job…" : "Start kid video job"}
          </button>

          {videoError && (
            <p className="text-[11px] text-rose-400 mt-2">{videoError}</p>
          )}

          {videoId && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-slate-400">
                Video job id:{" "}
                <span className="font-mono text-slate-200">{videoId}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Status:{" "}
                <span className="font-semibold text-emerald-300">
                  {videoStatus ?? "unknown"}
                </span>
              </p>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Kid video thumbnail"
                  className="mt-2 rounded-xl border border-slate-700 max-w-xs"
                />
              )}
              {videoUrl && (
                <video
                  controls
                  className="mt-3 w-full max-w-md rounded-2xl border border-slate-700"
                  src={videoUrl}
                />
              )}
            </div>
          )}
        </section>

        <footer className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p>
            Once this feels good, we&apos;ll move this logic into the main
            RANIA moment flow: selecting kid voice/kid video as delivery types,
            and auto-using the AI-crafted message as the script.
          </p>
        </footer>
      </div>
    </div>
  );
}