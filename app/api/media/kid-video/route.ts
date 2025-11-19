import { NextRequest, NextResponse } from "next/server";

import { resolveElevenLabsVoiceId } from "@/lib/kidVoices";
import { createKidVideoFromPhoto } from "@/lib/heygen";
import type { KidVoiceProfileId } from "@/types";

export const runtime = "nodejs";

interface KidVideoRequestBody {
  text: string;
  profileId: KidVoiceProfileId;
  userId: string;
  momentId?: string;
  photoAvatarId?: string; // optional, fallback to HEYGEN_DEFAULT_PHOTO_AVATAR_ID
}

/**
 * Start a kid video generation job from a photo avatar + text.
 * Returns { videoId, profileId, audioInlineAllowed }.
 *
 * Note: For now we let HeyGen handle its own voice; if you want
 * a perfect match with ElevenLabs audio, that would require a
 * different workflow (upload pre-generated audio to HeyGen).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<KidVideoRequestBody>;
    const { text, profileId, userId, momentId, photoAvatarId } = body;

    if (!text || !profileId || !userId) {
      return NextResponse.json(
        { error: "Missing text, profileId, or userId" },
        { status: 400 }
      );
    }

    // We still resolve the voice profile to ensure it's valid;
    // you can later map this to a HeyGen voice_id if needed.
    resolveElevenLabsVoiceId(profileId as KidVoiceProfileId);

    const video = await createKidVideoFromPhoto({
      scriptText: text,
      photoAvatarId: photoAvatarId,
      aspectRatio: "9:16",
    });

    return NextResponse.json({
      videoId: video.videoId,
      profileId,
      momentId: momentId ?? null,
    });
  } catch (err) {
    console.error("[RANIA] /api/media/kid-video error", err);
    return NextResponse.json(
      { error: "Failed to create kid video" },
      { status: 500 }
    );
  }
}