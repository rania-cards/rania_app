import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import { resolveElevenLabsVoiceId } from "@/lib/kidVoices";
import type { KidVoiceProfileId } from "@/types";

export const runtime = "nodejs";

interface KidVoiceRequest {
  text: string;
  profileId: KidVoiceProfileId;
  userId: string;
  momentId?: string | null;
}

/**
 * Generate a kid voice audio file and upload it to Supabase storage.
 * Returns { url, profileId } where url is a public URL to the audio file.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<KidVoiceRequest>;
    const { text, profileId, userId, momentId } = body;

    if (!text || !profileId || !userId) {
      return NextResponse.json(
        { error: "Missing text, profileId, or userId" },
        { status: 400 }
      );
    }

    const voiceId = resolveElevenLabsVoiceId(profileId as KidVoiceProfileId);

    const { audio, contentType } = await synthesizeSpeech(text, {
      voiceId,
      settings: {
        stability: 0.5,
        similarityBoost: 0.85,
        style: 0.3,
        useSpeakerBoost: true,
      },
    });

    const supabase = getSupabaseClient();
    const ext = contentType.includes("wav") ? "wav" : "mp3";
    const fileName = `${Date.now()}-${momentId ?? "kid-voice"}.${ext}`;
    const path = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("moment-audio")
      .upload(path, new Uint8Array(audio), {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error || !data) {
      console.error("[RANIA] Supabase upload error", error);
      return NextResponse.json(
        { error: "Failed to upload kid voice audio" },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage
      .from("moment-audio")
      .getPublicUrl(data.path).data.publicUrl;

    return NextResponse.json({
      url: publicUrl,
      profileId,
    });
  } catch (err) {
    console.error("[RANIA] /api/media/kid-voice error", err);
    return NextResponse.json(
      { error: "Failed to generate kid voice" },
      { status: 500 }
    );
  }
}