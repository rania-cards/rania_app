
import { NextResponse } from "next/server";
import { generateMomentMessage } from "@/lib/openai";

export const runtime = "nodejs"; // we rely on Node.js, not edge runtime

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      receiverName,
      occasion,
      relationship,
      vibe,
      userMessage,
      extraDetails,
    } = body as {
      receiverName: string;
      occasion: string;
      relationship: string;
      vibe: string;
      userMessage?: string;
      extraDetails?: string;
    };

    if (!receiverName || !occasion || !relationship || !vibe) {
      return NextResponse.json(
        { error: "Missing required fields for generation" },
        { status: 400 }
      );
    }

    const message = await generateMomentMessage({
      receiverName,
      occasion,
      relationship,
      vibe,
      userNotes: userMessage,
      extraDetails,
    });

    return NextResponse.json({ message });
  } catch (err: unknown) {
    console.error("[RANIA] generate-message error", err);
    return NextResponse.json(
      { error: "Failed to generate moment message" },
      { status: 500 }
    );
  }
}

