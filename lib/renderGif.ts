/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createCanvas,
  loadImage,
  CanvasRenderingContext2D,
} from "canvas";
import GIFEncoder from "gifencoder";
import gifFrames from "gif-frames";

const WIDTH = 1080;
const HEIGHT = 1920;

export type GifRenderInput = {
  tenorGifUrl: string;
  receiverName: string;
  message: string;
  senderName?: string;
};

export type GifRenderOutput = {
  gifDataUrl: string;
};

export async function renderStatusCardGif(
  input: GifRenderInput
): Promise<GifRenderOutput> {
  const { tenorGifUrl, receiverName, message, senderName } = input;

  try {
    const allFrames: any[] = await gifFrames({
      url: tenorGifUrl,
      frames: "all",
      outputType: "png",
    });

    if (!allFrames || allFrames.length === 0) {
      throw new Error("No frames decoded from Tenor GIF");
    }

    const maxFrames = 20;
    const step = Math.max(1, Math.floor(allFrames.length / maxFrames));
    const frames = allFrames.filter((_: any, idx: number) => idx % step === 0);

    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(80);
    encoder.setQuality(10);

    for (const frame of frames) {
      const buf: Buffer = await streamToBuffer(frame.getImage());
      const tenorFrame = await loadImage(buf);

      drawSingleFrame(ctx, tenorFrame, {
        receiverName,
        senderName,
        message,
      });

      encoder.addFrame(ctx as any);
    }

    encoder.finish();
    const buffer: Buffer = encoder.out.getData();
    const base64 = buffer.toString("base64");
    const gifDataUrl = `data:image/gif;base64,${base64}`;

    return { gifDataUrl };
  } catch (err: any) {
    console.error("❌ GIF render error:", err?.message || err);
    throw new Error(err?.message || "Failed to render GIF");
  }
}

// ======================================================================
// ⭐ FRAME DRAWING
// ======================================================================

type FrameMeta = {
  receiverName: string;
  senderName?: string;
  message: string;
};

function drawSingleFrame(
  ctx: CanvasRenderingContext2D,
  tenorFrame: any,
  meta: FrameMeta
) {
  const { receiverName, senderName, message } = meta;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // 🔥 Smooth gradient background
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#0f0f1a");
  bg.addColorStop(1, "#050510");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ⭐ Draw GIF
  const gifW = WIDTH * 0.55;
  const aspect = tenorFrame.width / tenorFrame.height;
  const gifH = gifW / aspect;

  const gifX = (WIDTH - gifW) / 2;
  const gifY = 180;

  ctx.drawImage(tenorFrame, gifX, gifY, gifW, gifH);

  // ======================================================================
  // ⭐ MAIN MESSAGE (BOLD, THICK, GLOW)
  // ======================================================================

  ctx.textAlign = "center";
  ctx.fillStyle = "#e0f2fe";
  ctx.font =
    '800 58px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const maxWidth = WIDTH * 0.75;
  const lines = wrapLines(ctx, `"${message}"`, maxWidth);
  let y = gifY + gifH + 120;

  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 12;

  for (const line of lines) {
    drawBoldText(ctx, line, WIDTH / 2, y);
    y += 70;
  }

  ctx.shadowBlur = 0;

  // ======================================================================
  // ⭐ RECEIVER — "For"
  // ======================================================================
  y += 40;

  ctx.textAlign = "left";

  ctx.fillStyle = "#94a3b8";
  ctx.font = '700 32px system-ui';
  drawBoldText(ctx, "For", 120, y);

  ctx.fillStyle = "#4ade80";
  ctx.font = '900 46px system-ui';
  drawBoldText(ctx, receiverName || "Someone Special", 120, y + 60);

  // ======================================================================
  // ⭐ SENDER — "From"
  // ======================================================================
  if (senderName) {
    y += 150;

    ctx.fillStyle = "#94a3b8";
    ctx.font = '700 32px system-ui';
    drawBoldText(ctx, "From", 120, y);

    ctx.fillStyle = "#f1f5f9";
    ctx.font = '900 44px system-ui';
    drawBoldText(ctx, senderName, 120, y + 60);
  }
}

// ======================================================================
// ⭐ HELPERS
// ======================================================================

// Makes text THICK + glowing like preview
function drawBoldText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.strokeText(text, x, y);

  ctx.fillText(text, x, y);

  ctx.shadowColor = "rgba(255,255,255,0.23)";
  ctx.shadowBlur = 18;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  return lines;
}

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
