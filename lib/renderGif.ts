/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { createCanvas, Image } from "canvas";
import GIFEncoder from "gifencoder";
import fetch from "node-fetch";

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

// ---- FIXED: proper Tenor loader (handles redirects, webp, mp4, etc.) ----
async function loadTenorGif(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Tenor media");

  const buffer = Buffer.from(await res.arrayBuffer());
  const img = new Image();
  img.src = buffer;
  return img;
}

export async function renderStatusCardGif(
  input: GifRenderInput
): Promise<GifRenderOutput> {
  const { tenorGifUrl, receiverName, message, senderName } = input;

  // FIXED: load using our own loader – avoids loadImage() type mismatch + GIF issues
  const gifImage = await loadTenorGif(tenorGifUrl);

  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx: any = canvas.getContext("2d");

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(140);
  encoder.setQuality(10);

  const frames = 6;

  for (let i = 0; i < frames; i++) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // === Background gradient ===
    const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    const intensityTop = 0.35 + i * 0.02;
    const intensityBottom = 0.25 + (frames - i) * 0.01;

    bg.addColorStop(0, `rgba(76, 29, 149, ${intensityTop})`);
    bg.addColorStop(0.5, "rgba(15, 23, 42, 0.95)");
    bg.addColorStop(1, `rgba(8, 47, 73, ${intensityBottom})`);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // === Card container ===
    const cardWidth = Math.floor(WIDTH * 0.72);
    const cardHeight = Math.floor(HEIGHT * 0.78);
    const cardX = Math.floor((WIDTH - cardWidth) / 2);
    const cardY = Math.floor((HEIGHT - cardHeight) / 2);

    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.fill();

    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(168, 85, 247, 0.9)";
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
    ctx.stroke();

    // === Badge ===
    const badgeWidth = 420;
    const badgeHeight = 64;
    const badgeX = WIDTH / 2 - badgeWidth / 2;
    const badgeY = cardY + 42;

    roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 32);
    ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 32);
    ctx.stroke();

    ctx.font = '600 20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(216, 180, 254, 0.95)";
    ctx.fillText("🌈 STATUS TRIO MOMENT", WIDTH / 2, badgeY + badgeHeight / 2);

    // === GIF Box ===
    const gifBoxWidth = Math.floor(cardWidth * 0.62);
    const gifBoxHeight = Math.floor(cardHeight * 0.45);
    const gifBoxX = WIDTH / 2 - gifBoxWidth / 2;
    const gifBoxY = badgeY + badgeHeight + 40;

    roundRect(ctx, gifBoxX, gifBoxY, gifBoxWidth, gifBoxHeight, 32);
    ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(192, 132, 252, 0.9)";
    roundRect(ctx, gifBoxX, gifBoxY, gifBoxWidth, gifBoxHeight, 32);
    ctx.stroke();

    // === Draw GIF first frame ===
    const aspect = gifImage.width / gifImage.height;
    let drawW = gifBoxWidth - 24;
    let drawH = drawW / aspect;
    if (drawH > gifBoxHeight - 24) {
      drawH = gifBoxHeight - 24;
      drawW = drawH * aspect;
    }
    const drawX = WIDTH / 2 - drawW / 2;
    const drawY = gifBoxY + gifBoxHeight / 2 - drawH / 2;

    ctx.drawImage(gifImage, drawX, drawY, drawW, drawH);

    // Overlay
    const gifOverlay = ctx.createLinearGradient(
      0,
      gifBoxY,
      0,
      gifBoxY + gifBoxHeight
    );
    gifOverlay.addColorStop(0, "rgba(15, 23, 42, 0.0)");
    gifOverlay.addColorStop(1, "rgba(15, 23, 42, 0.30)");
    ctx.fillStyle = gifOverlay;
    roundRect(ctx, gifBoxX, gifBoxY, gifBoxWidth, gifBoxHeight, 32);
    ctx.fill();

    // Divider
    const dividerY = gifBoxY + gifBoxHeight + 44;
    ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
    ctx.fillRect(cardX + 40, dividerY, cardWidth - 80, 1);

    // Message
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.font = '600 18px system-ui';
    ctx.fillText("Message", cardX + 50, dividerY + 46);

    ctx.textAlign = "center";
    ctx.fillStyle = "#e0f2fe";
    ctx.font = '600 30px system-ui';
    const maxTextWidth = cardWidth - 100;

    wrapAndFillText(
      ctx,
      `“${message}”`,
      WIDTH / 2,
      dividerY + 90,
      maxTextWidth,
      38
    );

    // For / From
    let blockY = dividerY + 220;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
    ctx.font = '600 18px system-ui';
    ctx.fillText("For", cardX + 50, blockY);

    ctx.font = '700 30px system-ui';
    ctx.fillStyle = "#4ade80";
    ctx.fillText(receiverName || "Someone Special", cardX + 50, blockY + 36);

    if (senderName) {
      blockY += 90;
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.font = '600 18px system-ui';
      ctx.fillText("From", cardX + 50, blockY);

      ctx.font = '700 28px system-ui';
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(senderName, cardX + 50, blockY + 34);
    }

    // Footer
    ctx.textAlign = "center";
    ctx.font = '500 20px system-ui';
    ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
    ctx.fillText("RANIA • raniaonline.com", WIDTH / 2, cardY + cardHeight - 32);

    encoder.addFrame(ctx);
  }

  encoder.finish();

  const buffer: Buffer = encoder.out.getData();
  const base64 = buffer.toString("base64");
  const gifDataUrl = `data:image/gif;base64,${base64}`;

  return { gifDataUrl };
}

// ================================
// Helpers — types removed (ctx: any)
// ================================

function roundRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapAndFillText(
  ctx: any,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  let y = startY;
  for (const l of lines) {
    ctx.fillText(l, centerX, y);
    y += lineHeight;
  }
}
