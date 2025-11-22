import { NextRequest, NextResponse } from "next/server";
import { getHeyGenVideoStatus } from "@/lib/heygen";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId" },
        { status: 400 }
      );
    }

    const status = await getHeyGenVideoStatus(videoId);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[RANIA] /api/media/kid-video/status error", err);
    return NextResponse.json(
      { error: "Failed to fetch kid video status" },
      { status: 500 }
    );
  }
}
