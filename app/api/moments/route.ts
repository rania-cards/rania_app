import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DeliveryType = "text" | "user_voice" | "user_video";

type CreateMomentBody = {
  guestId?: string;
  userId?: string;
  receiverName: string;
  occasion: string;
  relationship: string;
  tone?: string;
  category?: string;
  templateId?: string | null;
  deliveryType?: DeliveryType;
  messageText: string;
  mediaUrl?: string | null;
  referrerId?: string | null;
  isPremium?: boolean;
  priceCharged?: number;
};

type MomentRow = {
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  category: string | null;
  delivery_type: DeliveryType;
  message_text: string | null;
  media_url: string | null;
  is_premium: boolean;
  price_charged: number;
  referrer_id: string | null;
  created_at: string;
};

// Server-side Supabase client
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateMomentBody>;

    const receiverName = (body.receiverName ?? "").trim();
    const occasion = (body.occasion ?? "").trim();
    const relationship = (body.relationship ?? "").trim();
    const tone = (body.tone ?? "").trim();
    const category = body.category ?? null;
    const templateId = body.templateId ?? null;
    const deliveryType: DeliveryType = body.deliveryType ?? "text";
    const messageText = (body.messageText ?? "").trim();
    const mediaUrl = body.mediaUrl ?? null;
    const referrerId = body.referrerId ?? null;
    const isPremium = Boolean(body.isPremium);
    const priceCharged = body.priceCharged ?? 0;

    // Choose identity — PRIORITY: userId → fallback to guestId
    const finalUserId = body.userId?.trim() || body.guestId?.trim();

    if (!finalUserId) {
      return NextResponse.json(
        { error: "Missing userId or guestId." },
        { status: 400 }
      );
    }

    if (!receiverName || !occasion || !relationship || !messageText) {
      return NextResponse.json(
        {
          error:
            "receiverName, occasion, relationship, and messageText are required.",
        },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // If guestId, ensure a guest user exists in the users table
    if (finalUserId.startsWith("guest_")) {
      await supabase
        .from("users")
        .upsert({
          id: finalUserId, // guest UUID string
          email: null,
          name: null,
          plan: "free",
        })
        .throwOnError();
    }

    const { data, error } = await supabase
      .from("moments")
      .insert({
        user_id: finalUserId,
        receiver_name: receiverName,
        occasion,
        relationship,
        tone,
        category,
        template_id: templateId,
        delivery_type: deliveryType,
        message_text: messageText,
        media_url: mediaUrl,
        is_premium: isPremium,
        price_charged: priceCharged,
        referrer_id: referrerId,
      })
      .select("*")
      .single<MomentRow>();

    if (error) {
      console.error("Error inserting moment:", error);
      return NextResponse.json(
        { error: error.message ?? "Failed to create moment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ moment: data });
  } catch (err) {
    console.error("Error in /api/moments POST:", err);
    return NextResponse.json(
      { error: "Failed to create moment" },
      { status: 500 }
    );
  }
}


