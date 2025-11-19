import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { RaniaMoment } from "@/types";

export async function GET(
  _req: NextRequest,
  context: { params: { momentId: string } }
) {
  const { momentId } = context.params;

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("id", momentId)
    .maybeSingle<RaniaMoment>();

  if (error) {
    console.error("Error fetching moment", error);
    return NextResponse.json(
      { error: "Failed to load moment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ momentId, moment: data });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { momentId: string } }
) {
  const { momentId } = context.params;
  const supabase = getSupabaseClient();

  const body = await req.json().catch(() => ({} as Partial<RaniaMoment>));

  const { error } = await supabase
    .from("moments")
    .update(body)
    .eq("id", momentId);

  if (error) {
    console.error("Error updating moment", error);
    return NextResponse.json(
      { error: "Failed to update moment" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    momentId,
    message: "Moment updated (stub)",
  });
}