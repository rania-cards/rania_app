import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { RaniaMoment } from "@/types";

export const runtime = "nodejs";

/**
 * GET /api/moments?userId=...
 * Returns all moments for the given user (most recent first).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      // For safety, return empty list if no userId is provided
      return NextResponse.json({ moments: [] });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[RANIA] Error fetching moments", error);
      return NextResponse.json(
        { error: "Failed to load moments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ moments: (data || []) as RaniaMoment[] });
  } catch (err) {
    console.error("[RANIA] /api/moments GET error", err);
    return NextResponse.json(
      { error: "Unexpected error while loading moments" },
      { status: 500 }
    );
  }
}

/**
 * Body expected from CreateMomentPage's handleCreateMomentOnServer:
 *
 * {
 *   userId: string;
 *   receiverName: string;
 *   occasion: string;
 *   relationship: string;
 *   tone?: string;
 *   category?: string;
 *   templateId?: string | null;
 *   deliveryType: DeliveryType;
 *   messageText: string;
 *   mediaUrl?: string | null;
 *   referrerId?: string | null;
 *   useFreePremiumMoment?: boolean;
 * }
 *
 * We store these into the "moments" table and return { moment }.
 */
type CreateMomentBody = {
  userId: string;
  receiverName: string;
  occasion: string;
  relationship: string;
  tone?: string;
  category?: string | null;
  templateId?: string | null;
  deliveryType: string;
  messageText: string;
  mediaUrl?: string | null;
  referrerId?: string | null;
  useFreePremiumMoment?: boolean;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<CreateMomentBody>;

    const {
      userId,
      receiverName,
      occasion,
      relationship,
      tone,
      category,
      templateId,
      deliveryType,
      messageText,
      mediaUrl,
      referrerId,
    } = body;

    if (!userId || !receiverName || !occasion || !relationship || !deliveryType || !messageText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Basic free/premium guess: if it's not text, treat as premium
    const isPremium = deliveryType !== "text";
    // Price logic is primarily handled in the frontend;
    // here we default to 0 and let the UI's premiumPrice handle display.
    const priceCharged = isPremium ? 130 : 0;

    const { data, error } = await supabase
      .from("moments")
      .insert({
        user_id: userId,
        receiver_name: receiverName,
        occasion,
        relationship,
        tone: tone ?? null,
        category: category ?? null,
        template_id: templateId ?? null,
        delivery_type: deliveryType,
        message_text: messageText,
        media_url: mediaUrl ?? null,
        is_premium: isPremium,
        price_charged: priceCharged,
        has_watermark: !isPremium, // premium usually no watermark
        referrer_id: referrerId ?? null,
      })
      .select("*")
      .maybeSingle<RaniaMoment>();

    if (error || !data) {
      console.error("[RANIA] Error inserting moment", error);
      return NextResponse.json(
        { error: "Failed to create moment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ moment: data });
  } catch (err) {
    console.error("[RANIA] /api/moments POST error", err);
    return NextResponse.json(
      { error: "Unexpected error while creating moment" },
      { status: 500 }
    );
  }
}