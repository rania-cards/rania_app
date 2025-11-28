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
  encoder.setDelay(85);
  encoder.setQuality(10);

  // ⭐ NEW TEAL BLUE GRADIENT BACKGROUND
  const fixedGradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  fixedGradient.addColorStop(0, "#065f46"); // deep emerald
  fixedGradient.addColorStop(1, "#0f172a"); // navy slate

  // ⭐ FIXED MESSAGE TEXT GRADIENT
  const messageGradient = ctx.createLinearGradient(
    WIDTH / 2 - 250,
    800,
    WIDTH / 2 + 250,
    1200
  );
  messageGradient.addColorStop(0, "#f8fafc");
  messageGradient.addColorStop(1, "#e2e8f0");

  for (const frame of frames) {
    const buf: Buffer = await streamToBuffer(frame.getImage());
    const tenorFrame = await loadImage(buf);

    drawFrame(ctx, tenorFrame, {
      receiverName,
      senderName,
      message,
      background: fixedGradient,
      messageGradient,
    });

    encoder.addFrame(ctx as any);
  }

  encoder.finish();
  const buffer: Buffer = encoder.out.getData();

  return {
    gifDataUrl: `data:image/gif;base64,${buffer.toString("base64")}`,
  };
}

// ======================================================
// DRAW FRAME (UPDATED WITH MEDIUM GIF)
// ======================================================
function drawFrame(
  ctx: CanvasRenderingContext2D,
  tenorFrame: any,
  meta: any
) {
  const { receiverName, senderName, message, background, messageGradient } = meta;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ======================================================
  // ⭐ GIF — MEDIUM SIZE (NO MORE CUTTING, FIXED)
  // ======================================================
  const maxGifHeight = HEIGHT * 0.33; // 33% height → nice medium
  const scale = maxGifHeight / tenorFrame.height;
  const gifW = tenorFrame.width * scale;
  const gifH = maxGifHeight;
  const gifX = (WIDTH - gifW) / 2;
  const gifY = 110;

  ctx.drawImage(tenorFrame, gifX, gifY, gifW, gifH);

  // ======================================================
  // ⭐ MESSAGE TEXT BELOW GIF
  // ======================================================
  ctx.textAlign = "center";
  ctx.font = '900 58px "Segoe UI", sans-serif';
  ctx.fillStyle = messageGradient;

  const maxWidth = WIDTH * 0.8;
  const lines = wrapLines(ctx, message, maxWidth);

  let y = gifY + gifH + 140;

  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y);
    y += 70;
  }

  // ======================================================
  // ⭐ "For"
  // ======================================================
  y += 50;
  ctx.textAlign = "left";

  ctx.font = "700 32px system-ui";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("For", 120, y);

  ctx.font = "900 46px system-ui";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(receiverName || "Someone", 120, y + 50);

  if (senderName) {
    y += 140;
    ctx.font = "700 32px system-ui";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText("From", 120, y);

    ctx.font = "900 46px system-ui";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(senderName, 120, y + 50);
  }
}

// ======================================================
// HELPERS
// ======================================================
function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
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
