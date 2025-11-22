import { NextRequest, NextResponse } from "next/server";
import { createHeyGenVideoFromPhoto } from "@/lib/heygen";

export const runtime = "nodejs";

interface KidVideoRequestBody {
  /**
   * Text for the avatar to speak.
   */
  text: string;
  /**
   * Optional: custom photo avatar id.
   * If not provided, HEYGEN_DEFAULT_PHOTO_AVATAR_ID will be used.
   */
  photoAvatarId?: string;
  /**
   * RANIA user id (for logging / future linkage).
   */
  userId: string;
  /**
   * Optional moment id (for future linking).
   */
  momentId?: string | null;
}

interface KidVideoSuccessResponse {
  videoId: string;
  momentId: string | null;
}

interface KidVideoErrorResponse {
  error: string;
}

/**
 * Start a HeyGen talking photo video job for RANIA.
 * 
 * POST /api/media/kid-video
 * Body: { text, userId, photoAvatarId?, momentId? }
 * 
 * Response: { videoId, momentId }
 *
 * NOTE: The actual final video URL is fetched via
 * GET /api/media/kid-video/status?videoId=...
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<KidVideoSuccessResponse | KidVideoErrorResponse>> {
  try {
    const body = (await req.json()) as Partial<KidVideoRequestBody>;
    const { text, userId, photoAvatarId, momentId } = body;

    if (!text || !userId) {
      return NextResponse.json(
        { error: "Missing text or userId" },
        { status: 400 }
      );
    }

    const result = await createHeyGenVideoFromPhoto({
      scriptText: text,
      photoAvatarId,
      aspectRatio: "9:16",
    });

    return NextResponse.json({
      videoId: result.videoId,
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