import { NextRequest, NextResponse } from "next/server";
import {
  generateMomentMessage,
  type GenerateMomentInput,
} from "@/lib/openai";

/**
 * POST /api/moments/generate-message
 *
 * Expects JSON body:
 * {
 *   receiverName: string;
 *   occasion: string;
 *   relationship: string;
 *   tone: string;
 *   userMessage: string;
 *   extraDetails?: string;
 * 
 * }
 *
 * Returns:
 * { message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as Partial<GenerateMomentInput>;

    const receiverName = (json.receiverName ?? "").trim();
    const occasion = (json.occasion ?? "").trim();
    const relationship = (json.relationship ?? "").trim();
    const tone = (json.tone ?? "").trim();
    const userMessage = (json.userMessage ?? "").trim();
    const extraDetails = (json.extraDetails ?? "").trim();

    if (!receiverName || !occasion || !relationship || !tone || !userMessage) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Please provide receiverName, occasion, relationship, tone, and userMessage.",
        },
        { status: 400 }
      );
    }

    const message = await generateMomentMessage({
      receiverName,
      occasion,
      relationship,
      tone,
      userMessage,
      extraDetails,
    });

    return NextResponse.json({ message });
  } catch (error: unknown) {
    console.error("Error in /api/moments/generate-message:", error);

    const errMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Failed to generate moment message: ${errMessage}` },
      { status: 500 }
    );
  }
}