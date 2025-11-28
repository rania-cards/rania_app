/* eslint-disable @typescript-eslint/no-explicit-any */

// gif/render-card/route

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { execFile } from "child_process";
import { promisify } from "util";
import os from "os";
import path from "path";
import fs from "fs/promises";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FONT_FILE = process.env.RANIA_CARD_FONT_PATH || "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type RenderRequest = {
  tenorUrl: string;       // MP4 URL from Tenor
  receiverName: string;
  senderName?: string;
  message: string;        // AI-polished message
};

function sanitizeDrawtextText(text: string): string {
  // ffmpeg drawtext is VERY sensitive: escape colon, apostrophe, backslash, etc.
  return text
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, " ");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RenderRequest;
    const { tenorUrl, receiverName, senderName, message } = body;

    if (!tenorUrl || !message || !receiverName) {
      return NextResponse.json(
        { error: "Missing tenorUrl, message or receiverName" },
        { status: 400 }
      );
    }

    // 1) Download Tenor MP4 to temp file
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `rania-tenor-${Date.now()}.mp4`);
    const outputPath = path.join(tmpDir, `rania-card-${Date.now()}.mp4`);

    const mp4Res = await fetch(tenorUrl);
    if (!mp4Res.ok) {
      console.error("Failed to download Tenor MP4", mp4Res.status);
      return NextResponse.json(
        { error: "Failed to download Tenor media" },
        { status: 502 }
      );
    }
    const mp4Buffer = Buffer.from(await mp4Res.arrayBuffer());
    await fs.writeFile(inputPath, mp4Buffer);

    // 2) Build ffmpeg filter_complex for 1080x1920 card
    const safeMessage = sanitizeDrawtextText(message);
    const safeFor = sanitizeDrawtextText(
      receiverName.trim() ? `For ${receiverName.trim()}` : "For someone special"
    );
    const safeFrom = senderName && senderName.trim()
      ? sanitizeDrawtextText(`From ${senderName.trim()}`)
      : "";

    // Explanation:
    // - Create 1080x1920 background
    // - Scale the input video to max width 960, keep aspect, place near top
    // - Draw message centered
    // - Draw For and From at bottom left
    const filterComplex = [
      // background
      "color=c=#020617:size=1080x1920:d=999[bg]",

      // scale tenor video
      "[0:v]scale=960:-1:force_original_aspect_ratio=decrease,setsar=1[v0]",

      // overlay video onto background at (center, 120px from top)
      "[bg][v0]overlay=(W-w)/2:120:shortest=1[base]",

      // main message in center
      `[base]drawtext=fontfile='${FONT_FILE}':text='${safeMessage}':` +
        "x=(w-tw)/2:y=(h-th)/2:" +
        "fontsize=44:fontcolor=0xf9fafb:" +
        "borderw=3:bordercolor=0x000000@0.85:" +
        "line_spacing=12[base2]",

      // For line at bottom left
      `[base2]drawtext=fontfile='${FONT_FILE}':text='${safeFor}':` +
        "x=80:y=h-160:" +
        "fontsize=38:fontcolor=0x6ee7b7:" +
        "borderw=2:bordercolor=0x000000@0.7[base3]",

      // From line if present
      safeFrom
        ? `[base3]drawtext=fontfile='${FONT_FILE}':text='${safeFrom}':` +
          "x=80:y=h-100:" +
          "fontsize=30:fontcolor=0xe5e7eb:" +
          "borderw=2:bordercolor=0x000000@0.7[final]"
        : "[base3]null[final]",
    ].join(";");

    const ffmpegArgs = [
      "-y",
      "-i",
      inputPath,
      "-filter_complex",
      filterComplex,
      "-map",
      "[final]",
      "-movflags",
      "+faststart",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      outputPath,
    ];

    // 3) Run ffmpeg
    try {
      await execFileAsync("ffmpeg", ffmpegArgs);
    } catch (err: any) {
      console.error("ffmpeg error", err?.stderr || err);
      return NextResponse.json(
        { error: "Failed to render video card" },
        { status: 500 }
      );
    }

    // 4) Read rendered video & upload to Supabase
    const renderedBuffer = await fs.readFile(outputPath);
    const fileName = `gif-cards/rania-card-${Date.now()}.mp4`;

    const { data, error: uploadErr } = await supabaseAdmin.storage
      .from("moments-media")
      .upload(fileName, renderedBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Supabase upload error", uploadErr);
      return NextResponse.json(
        { error: "Failed to upload rendered video" },
        { status: 500 }
      );
    }

    const publicUrl = supabaseAdmin.storage
      .from("moments-media")
      .getPublicUrl(data.path).data.publicUrl;

    // 5) Cleanup temp files
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    return NextResponse.json(
      {
        videoUrl: publicUrl,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("render-card error", err);
    return NextResponse.json(
      { error: err.message || "Failed to render animated card" },
      { status: 500 }
    );
  }
}