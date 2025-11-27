/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { searchTenorGifs } from "@/lib/tenor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "";
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) || 6 : 6;

    if (!query) {
      return NextResponse.json(
        { error: "Missing q parameter" },
        { status: 400 }
      );
    }

    const gifUrls = await searchTenorGifs(query, limit);

    return NextResponse.json(
      {
        query,
        gifUrls,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[TENOR] search route error", err);
    return NextResponse.json(
      { error: "Tenor search failed" },
      { status: 500 }
    );
  }
}