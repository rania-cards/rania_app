import { NextRequest, NextResponse } from "next/server";
import { getHeyGenVideoStatus } from "@/lib/heygen";

export const runtime = "nodejs";

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

    const details = await getHeyGenVideoStatus(videoId);

    return NextResponse.json(details, { status: 200 });
  } catch (err) {
    console.error("[RANIA] /api/media/kid-video/status GET error", err);
    return NextResponse.json(
      { error: "Failed to fetch kid video status" },
      { status: 500 }
    );
  }
}