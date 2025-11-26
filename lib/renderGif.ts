/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { createCanvas, loadImage, Image } from "canvas";
import GIFEncoder from "gifencoder";
import { GifPackId, getGifPack } from "./templates";

const WIDTH = 1080;
const HEIGHT = 1920;

export type GifRenderInput = {
  packId: GifPackId;
  receiverName: string;
  introLine: string;
  shortMessage: string;
};

export type GifRenderOutput = {
  gifDataUrl: string;
};

// ⚡ Cache loaded images to avoid re-reading PNG files
const imageCache = new Map<string, Image>();

async function loadImageCached(filePath: string): Promise<Image> {
  if (imageCache.has(filePath)) {
    return imageCache.get(filePath)!;
  }
  
  const img = await loadImage(filePath);
  imageCache.set(filePath, img);
  return img;
}

export async function renderStatusGif(
  input: GifRenderInput
): Promise<GifRenderOutput> {
  const startTime = Date.now();
  
  const pack = getGifPack(input.packId);
  if (!pack) {
    throw new Error("Invalid GIF pack");
  }

  // 1) Setup encoder (once per call)
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(140); // ms per frame
  encoder.setQuality(10);

  // 2) Create canvas (reuse for all frames)
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // 3) ⚡ Load frames WITH CACHING - only fetch if not cached
  console.log(`🖼️ Loading ${pack.framePngs.length} frames for ${input.packId}...`);
  const frameLoadStart = Date.now();
  
  const frameImages = await Promise.all(
    pack.framePngs.map((relPath) =>
      loadImageCached(path.join(process.cwd(), "public", relPath))
    )
  );
  
  console.log(`✅ Frames loaded in ${Date.now() - frameLoadStart}ms`);

  // 4) ⚡ Draw frames directly (minimal ctx operations)
  console.log(`🎨 Rendering text on ${frameImages.length} frames...`);
  const renderStart = Date.now();

  for (const img of frameImages) {
    // Clear & draw base image (fastest)
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

    // ⚡ Batch text rendering - reuse ctx settings
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 18;

    // Intro line
    ctx.font = '500 42px "Poppins", system-ui, sans-serif';
    ctx.fillText(input.introLine, WIDTH / 2, HEIGHT * 0.14);

    // BIG NAME (most prominent)
    ctx.font = '800 120px "Playfair Display", "Georgia", serif';
    ctx.fillText(input.receiverName.toUpperCase(), WIDTH / 2, HEIGHT * 0.33);

    // Short message
    ctx.font = '500 40px "Poppins", system-ui, sans-serif';
    ctx.fillText(input.shortMessage, WIDTH / 2, HEIGHT * 0.55);

    // Add frame to GIF
    encoder.addFrame(ctx as any);
  }

  console.log(`✅ Text rendered in ${Date.now() - renderStart}ms`);

  // 5) ⚡ Finish encoding (async where possible)
  console.log(`⏳ Encoding GIF...`);
  const encodeStart = Date.now();
  
  encoder.finish();
  const buffer: Buffer = encoder.out.getData();
  
  console.log(`✅ GIF encoded in ${Date.now() - encodeStart}ms`);

  // 6) Convert to data URL
  const base64 = buffer.toString("base64");
  const gifDataUrl = `data:image/gif;base64,${base64}`;

  const totalTime = Date.now() - startTime;
  console.log(`✅ renderStatusGif complete in ${totalTime}ms`);

  return { gifDataUrl };
}