import { NextRequest, NextResponse } from "next/server";
import {
  createHeyGenVideo,
  getHeyGenVideoStatus,
} from "@/lib/heygen";

export const runtime = "nodejs";

type KidVideoCreateBody = {
  scriptText: string;
  avatarId?: string;
  voiceId?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<KidVideoCreateBody>;
    const scriptText = body.scriptText?.trim();

    if (!scriptText) {
      return NextResponse.json(
        { error: "Missing 'scriptText' in request body." },
        { status: 400 }
      );
    }

    const result = await createHeyGenVideo({
      scriptText,
      avatarId: body.avatarId,
      voiceId: body.voiceId,
      aspectRatio: body.aspectRatio,
    });

    return NextResponse.json(
      {
        videoId: result.videoId,
        status: "pending" as const,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[RANIA] /api/media/kid-video POST error", err);
    return NextResponse.json(
      { error: "Failed to start kid video generation" },
      { status: 500 }
    );
  }
}