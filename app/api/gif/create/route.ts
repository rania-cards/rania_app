/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderStatusCardGif } from "@/lib/renderGif";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type GifCreateRequest = {
  tenorGifUrl: string;             // SELECTED Tenor GIF from client
  receiverName: string;
  message: string;
  senderName?: string;
};

type GifCreateResponse = {
  gifDataUrl?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GifCreateRequest;
    const { tenorGifUrl, receiverName, message, senderName } = body;

    if (!tenorGifUrl || !receiverName || !message) {
      return NextResponse.json<GifCreateResponse>(
        { error: "Missing tenorGifUrl, receiverName or message" },
        { status: 400 }
      );
    }

    // Compose final GIF card with canvas + GIFEncoder
    const { gifDataUrl } = await renderStatusCardGif({
      tenorGifUrl,
      receiverName,
      message,
      senderName,
    });

    return NextResponse.json<GifCreateResponse>(
      { gifDataUrl },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GIF create error:", err);
    return NextResponse.json<GifCreateResponse>(
      { error: "Could not generate Status Trio GIF" },
      { status: 500 }
    );
  }
}