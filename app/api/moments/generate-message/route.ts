import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type GenerateMessageBody = {
  receiverName: string;
  occasion: string;
  relationship: string;
  vibe: string;
  userMessage?: string;
  extraDetails?: string;
};

function buildMomentMessage(input: GenerateMessageBody): string {
  const { receiverName, occasion, relationship, vibe, userMessage, extraDetails } =
    input;

  const name = receiverName || "you";
  const occ = occasion || "this moment";
  const rel = relationship || "someone special";

  const base = userMessage?.trim()
    ? userMessage.trim()
    : `I just wanted to send you a tiny moment to say how much you mean to me.`;

  const vibePrefixMap: Record<string, string> = {
    Sweet: "Hey " + name + ", ",
    Funny: "Okay, not to be dramatic 😂 but ",
    Deep: "From the deepest part of my heart, ",
    "Short & Cute": "Short and sweet: ",
    Romantic: "My heart picked up the phone to tell you this 💕 ",
    Heartfelt: "From me to you, with no filters, ",
  };

  const prefix =
    vibePrefixMap[vibe] ??
    `Hey ${name}, `;

  const extra = extraDetails?.trim()
    ? ` And I never want you to forget: ${extraDetails.trim()}.`
    : "";

  const tail =
    occasion && occasion.toLowerCase() !== "just because"
      ? ` Thank you for being my ${rel} and for sharing this ${occ} with me.`
      : ` Thank you for being my ${rel}.`;

  return `${prefix}${base}${extra}${tail} 💛`;
}

/**
 * POST /api/moments/generate-message
 * Body: { receiverName, occasion, relationship, vibe, userMessage?, extraDetails? }
 * Returns: { message: string }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<GenerateMessageBody>;

    const { receiverName, occasion, relationship, vibe } = body;

    if (!receiverName || !occasion || !relationship || !vibe) {
      return NextResponse.json(
        { error: "Missing required fields (receiverName, occasion, relationship, vibe)" },
        { status: 400 }
      );
    }

    const message = buildMomentMessage(body as GenerateMessageBody);

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[RANIA] /api/moments/generate-message error", err);
    return NextResponse.json(
      { error: "Failed to generate moment message" },
      { status: 500 }
    );
  }
}