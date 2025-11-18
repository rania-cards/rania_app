import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { userId, email } = (await req.json()) as {
      userId: string;
      email?: string | null;
    };

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          email: email ?? null,
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Error upserting user row", error);
      return NextResponse.json(
        { error: "Failed to ensure user row" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("ensure-user error", err);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}