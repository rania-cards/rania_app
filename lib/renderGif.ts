/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { createCanvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { GifPackId, getGifPack } from "./templates";

const WIDTH = 1080;
const HEIGHT = 1920;

export type GifRenderInput = {
  packId: GifPackId;
  receiverName: string;
  introLine: string;    // short line above
  shortMessage: string; // one-line message
};

export type GifRenderOutput = {
  gifDataUrl: string;   // data:image/gif;base64,...
};

export async function renderStatusGif(
  input: GifRenderInput
): Promise<GifRenderOutput> {
  const pack = getGifPack(input.packId);
  if (!pack) {
    throw new Error("Invalid GIF pack");
  }

  // 1) Setup encoder and canvas
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  encoder.start();
  encoder.setRepeat(0);   // loop forever
  encoder.setDelay(140);  // ms per frame
  encoder.setQuality(10);

  // 2) Preload PNG frames from /public
  const frameImages = await Promise.all(
    pack.framePngs.map((relPath) =>
      loadImage(path.join(process.cwd(), "public", relPath))
    )
  );

  // 3) Draw each frame & add to GIF
  for (const img of frameImages) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);

    // Intro line
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = '500 42px "Poppins", system-ui, sans-serif';
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 18;
    ctx.fillText(input.introLine, WIDTH / 2, HEIGHT * 0.14);

    // BIG NAME
    ctx.font = '800 120px "Playfair Display", "Georgia", serif';
    ctx.fillText(input.receiverName.toUpperCase(), WIDTH / 2, HEIGHT * 0.33);

    // Short message (one-line)
    ctx.font = '500 40px "Poppins", system-ui, sans-serif';
    ctx.fillText(input.shortMessage, WIDTH / 2, HEIGHT * 0.55);

    // Push into encoder
    encoder.addFrame(ctx as any);
  }

  // 4) Finish and get buffer directly (no streams)
  encoder.finish();
  const buffer: Buffer = encoder.out.getData(); // <- key line

  const base64 = buffer.toString("base64");
  const gifDataUrl = `data:image/gif;base64,${base64}`;

  return { gifDataUrl };
}
