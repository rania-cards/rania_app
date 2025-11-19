import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/elevenlabs";

export const runtime = "nodejs";

type KidVoiceRequestBody = {
  text: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<KidVoiceRequestBody>;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Missing 'text' in request body." },
        { status: 400 }
      );
    }

    const { audio, contentType } = await synthesizeSpeech(text);

    return new NextResponse(Buffer.from(audio), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(audio.byteLength),
        // Let browser download or play inline
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[RANIA] /api/media/kid-voice POST error", err);
    return NextResponse.json(
      { error: "Failed to generate kid voice audio" },
      { status: 500 }
    );
  }
}