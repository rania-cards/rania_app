import { NextRequest, NextResponse } from "next/server";
import { getKidVideoStatus } from "@/lib/heygen";

export const runtime = "nodejs";

/**
 * Poll the status of a HeyGen kid video job.
 * GET /api/media/kid-video/status?videoId=...
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId query parameter" },
        { status: 400 }
      );
    }

    const status = await getKidVideoStatus(videoId);

    return NextResponse.json(status);
  } catch (err) {
    console.error("[RANIA] /api/media/kid-video/status error", err);
    return NextResponse.json(
      { error: "Failed to fetch kid video status" },
      { status: 500 }
    );
  }
}