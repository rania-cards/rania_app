import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type DeliveryType = "text" | "user_voice" | "user_video";

type MomentRow = {
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  category: string | null;
  template_id: string | null;
  delivery_type: DeliveryType;
  message_text: string | null;
  media_url: string | null;
  is_premium: boolean;
  price_charged: number;
  referrer_id: string | null;
  created_at: string;
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(
  _req: Request,
  { params }: { params: { momentId: string } }
) {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", params.momentId)
      .single<MomentRow>();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Moment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ moment: data });
  } catch (err) {
    console.error("Error in /api/moments/[momentId]:", err);
    return NextResponse.json(
      { error: "Failed to fetch moment" },
      { status: 500 }
    );
  }
}