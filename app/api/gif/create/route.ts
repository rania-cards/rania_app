/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/gif/create/route.ts
import { renderStatusCardGif } from "@/lib/renderGif";
import { NextRequest, NextResponse } from "next/server";
// import { renderStatusCardGif } from "/lib/renderGif";

export const runtime = "nodejs";

const TENOR_API_KEY = process.env.TENOR_API_KEY!;
const TENOR_CLIENT_KEY = process.env.TENOR_CLIENT_KEY ?? "my-project";
const TENOR_LIMIT = 10; // search pool

type GifCreateRequest = {
  occasion?: string;
  receiverName: string;
  message: string;
  senderName?: string;
};

type GifCreateResponse = {
  gifDataUrl?: string;
  tenorGifUrl?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GifCreateRequest;
    const { occasion, receiverName, message, senderName } = body;

    if (!receiverName || !message) {
      return NextResponse.json<GifCreateResponse>(
        { error: "Missing receiverName or message" },
        { status: 400 }
      );
    }

    if (!TENOR_API_KEY) {
      console.error("TENOR_API_KEY missing");
      return NextResponse.json<GifCreateResponse>(
        { error: "Tenor not configured" },
        { status: 500 }
      );
    }

    // Map occasion → curated Tenor query
    const tenorQuery = buildTenorQuery(occasion, message);

    const tenorUrl = new URL("https://tenor.googleapis.com/v2/search");
    tenorUrl.searchParams.set("q", tenorQuery);
    tenorUrl.searchParams.set("key", TENOR_API_KEY);
    tenorUrl.searchParams.set("client_key", TENOR_CLIENT_KEY);
    tenorUrl.searchParams.set("limit", String(TENOR_LIMIT));
    tenorUrl.searchParams.set("contentfilter", "high"); // less wild
    tenorUrl.searchParams.set("media_filter", "gif");
    tenorUrl.searchParams.set("random", "true");

    const tenorRes = await fetch(tenorUrl.toString());
    const tenorJson = await tenorRes.json();

    if (!tenorRes.ok) {
      console.error("Tenor error:", tenorJson);
      return NextResponse.json<GifCreateResponse>(
        { error: "Failed to fetch GIF from Tenor" },
        { status: 400 }
      );
    }

    const results = tenorJson.results || [];
    const gifCandidate = results.find((r: any) => r.media_formats?.gif?.url);
    if (!gifCandidate) {
      return NextResponse.json<GifCreateResponse>(
        { error: "No matching GIF found" },
        { status: 404 }
      );
    }

    const tenorGifUrl: string = gifCandidate.media_formats.gif.url;

    // Compose final GIF card
    const { gifDataUrl } = await renderStatusCardGif({
      tenorGifUrl,
      receiverName,
      message,
      senderName,
    });

    return NextResponse.json<GifCreateResponse>(
      {
        gifDataUrl,
        tenorGifUrl,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GIF create error:", err);
    return NextResponse.json<GifCreateResponse>(
      { error: "Could not generate Status Trio GIF" },
      { status: 500 }
    );
  }
}

function buildTenorQuery(occasion?: string, message?: string): string {
  const base = (occasion || "").toLowerCase().trim();

  // Very rough mapping – you can tweak
  if (base.includes("birthday")) {
    return "birthday aesthetic loop";
  }
  if (base.includes("anniversary")) {
    return "romantic couple aesthetic loop";
  }
  if (base.includes("love") || base.includes("valentine")) {
    return "romantic heart glow loop";
  }
  if (base.includes("congrat")) {
    return "congratulations confetti elegant loop";
  }
  if (base.includes("sorry") || base.includes("apology")) {
    return "soft emotional apology aesthetic loop";
  }

  // fallback – light emotional, non-silly
  return `${base} aesthetic glowing loop` || "emotional aesthetic loop";
} 