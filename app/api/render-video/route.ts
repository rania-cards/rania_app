import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { synthesizeToFile } from "@/lib/azureTts";
import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { momentId } = await req.json();

    if (!momentId) {
      return NextResponse.json({ error: "momentId is required" }, { status: 400 });
    }

    const { data: moment, error } = await supabase
      .from("moments")
      .select("*")
      .eq("id", momentId)
      .single();

    if (error || !moment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    const text: string = moment.message_text || moment.message || "";
    if (!text) {
      return NextResponse.json({ error: "Moment has no text" }, { status: 400 });
    }

    const voiceId: string | null = moment.azure_voice_id || null;

    // 1) Generate TTS audio
    const audioPath = await synthesizeToFile(text, voiceId || undefined);

    // 2) Prepare paths
    const outputName = `${randomUUID()}.mp4`;
    const outputPath = path.join("/tmp", outputName);
    const bgPath = path.join(process.cwd(), "public", "templates", "bg.png");

    // 3) Run ffmpeg (still image + audio)
    await runFfmpeg(bgPath, audioPath, outputPath);

    // 4) Upload MP4 to Supabase Storage
    const buffer = await fs.readFile(outputPath);
    const storagePath = `rendered/${moment.user_id}/${momentId}/${outputName}`;

    const { error: uploadError } = await supabase.storage
      .from("moments-media")
      .upload(storagePath, buffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: signed } = await supabase.storage
      .from("moments-media")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 30); // 30 days

    const videoUrl = signed?.signedUrl;

    // 5) Save to moments table
    await supabase
      .from("moments")
      .update({ video_url: videoUrl })
      .eq("id", momentId);

    return NextResponse.json({ videoUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function runFfmpeg(bgPath: string, audioPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-loop", "1",
      "-i", bgPath,
      "-i", audioPath,
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest",
      "-y",
      outputPath,
    ]);

    ff.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}