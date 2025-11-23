/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type MomentRow = {
  id: string;
  user_id: string;
  receiver_name: string | null;
  occasion: string | null;
  relationship: string | null;
  tone: string | null;
  message_text: string | null;
  delivery_type: string;
  is_premium: boolean;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ momentId: string }> }
) {
  try {
    // Await params (Next.js 15+ requirement)
    const { momentId } = await params;

    if (!momentId) {
      return NextResponse.json(
        { error: "Missing momentId" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", momentId)
      .single<MomentRow>();

    if (error) {
      console.error("Error fetching moment:", error);
      return NextResponse.json(
        { error: "Moment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ moment: data });
  } catch (err: any) {
    console.error("Error in /api/moments/[momentId] GET:", err);
    return NextResponse.json(
      { error: "Failed to fetch moment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ momentId: string }> }
) {
  try {
    // Await params
    const { momentId } = await params;

    if (!momentId) {
      return NextResponse.json(
        { error: "Missing momentId" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const { error } = await supabase
      .from("moments")
      .delete()
      .eq("id", momentId);

    if (error) {
      console.error("Error deleting moment:", error);
      return NextResponse.json(
        { error: "Failed to delete moment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/moments/[momentId] DELETE:", err);
    return NextResponse.json(
      { error: "Failed to delete moment" },
      { status: 500 }
    );
  }
}