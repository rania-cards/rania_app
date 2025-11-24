import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const momentId = formData.get("momentId") as string | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !momentId || !userId) {
      return NextResponse.json(
        { error: "file, momentId, and userId are required" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/${momentId}/${randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("moments-media")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: signed } = await supabase.storage
      .from("moments-media")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    const mediaUrl = signed?.signedUrl;

    const { error: updateError } = await supabase
      .from("moments")
      .update({ media_url: mediaUrl })
      .eq("id", momentId)
      .eq("user_id", userId);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json(
        { error: "Failed to update moment with media URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mediaUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
