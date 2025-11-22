import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { synthesizeAzureSpeech } from "@/lib/azureTts";

export const runtime = "nodejs";

/**
 * Logical voice selectors that the frontend can send.
 *
 * - "en_us_youth" → American youth-style voice
 * - "en_ke"       → Kenyan English voice
 * - "sw_tz"       → Tanzanian Swahili voice
 */
export type SupportedVoiceKey = "en_us_youth" | "en_ke" | "sw_tz";

interface KidVoiceAzureRequest {
  text: string;
  voiceKey: SupportedVoiceKey;
  userId: string;
  momentId?: string | null;
}

interface KidVoiceAzureSuccessResponse {
  url: string;
  voiceKey: SupportedVoiceKey;
}

interface KidVoiceAzureErrorResponse {
  error: string;
}

/**
 * POST /api/media/kid-voice-azure
 *
 * Body: { text, voiceKey, userId, momentId? }
 * Returns: { url, voiceKey } on success.
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<KidVoiceAzureSuccessResponse | KidVoiceAzureErrorResponse>> {
  try {
    const body = (await req.json()) as Partial<KidVoiceAzureRequest>;
    const { text, voiceKey, userId, momentId } = body;

    // ✅ Correct validation for Azure: voiceKey, not profileId
    if (!text || !voiceKey || !userId) {
      return NextResponse.json(
        { error: "Missing text, voiceKey, or userId" },
        { status: 400 }
      );
    }

    const voiceName = resolveAzureVoiceName(voiceKey);

    // 1) Generate audio using Azure TTS
    const { audio, contentType } = await synthesizeAzureSpeech(text, {
      voiceName,
    });

    // 2) Upload to Supabase storage using SERVICE ROLE client
    const supabase = getSupabaseServerClient();
    const ext = contentType.includes("wav") ? "wav" : "mp3";
    const fileName = `${Date.now()}-${momentId ?? "kid-voice-azure"}.${ext}`;
    const path = `${userId}/${fileName}`;

    const uint8 = audio instanceof Uint8Array ? audio : new Uint8Array(audio);

    const { data, error } = await supabase.storage
      .from("moment-audio")
      .upload(path, uint8, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error || !data) {
      console.error("[RANIA] Supabase upload error (Azure TTS)", error);
      return NextResponse.json(
        { error: "Failed to upload Azure kid voice audio" },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage
      .from("moment-audio")
      .getPublicUrl(data.path).data.publicUrl;

    return NextResponse.json({
      url: publicUrl,
      voiceKey,
    });
  } catch (err) {
    console.error("[RANIA] /api/media/kid-voice-azure error", err);
    return NextResponse.json(
      { error: "Failed to generate kid voice (Azure)" },
      { status: 500 }
    );
  }
}

/**
 * Map logical voiceKey to concrete Azure voice name (from env vars).
 */
function resolveAzureVoiceName(voiceKey: SupportedVoiceKey): string {
  switch (voiceKey) {
    case "en_us_youth": {
      const v = process.env.AZURE_TTS_VOICE_EN_US_YOUTH;
      if (!v) {
        throw new Error(
          "AZURE_TTS_VOICE_EN_US_YOUTH is not set in environment variables."
        );
      }
      return v;
    }
    case "en_ke": {
      const v = process.env.AZURE_TTS_VOICE_EN_KE;
      if (!v) {
        throw new Error(
          "AZURE_TTS_VOICE_EN_KE is not set in environment variables."
        );
      }
      return v;
    }
    case "sw_tz": {
      const v = process.env.AZURE_TTS_VOICE_SW_TZ;
      if (!v) {
        throw new Error(
          "AZURE_TTS_VOICE_SW_TZ is not set in environment variables."
        );
      }
      return v;
    }
    default: {
      const neverKey: never = voiceKey;
      throw new Error(`Unsupported voiceKey: ${String(neverKey)}`);
    }
  }
}