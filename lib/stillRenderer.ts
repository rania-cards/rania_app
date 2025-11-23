export type StillTemplateId = "sunset" | "midnight" | "golden";

export const STILL_TEMPLATES: Record<StillTemplateId, string> = {
  sunset: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1080&h=1920&fit=crop",
  midnight: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop",
  golden: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop",
};

/**
 * Render still image with text on browser side (client-side)
 */
export async function renderStillImage(
  templateId: StillTemplateId,
  message: string
): Promise<string> {
  const templateUrl = STILL_TEMPLATES[templateId];
  if (!templateUrl) {
    throw new Error("Invalid template");
  }

  const width = 1080;
  const height = 1920;

  // Create canvas on browser
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // Load template image
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Text styling
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const fontSize = 48;
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;

      const lines = wrapText(ctx, message, width * 0.8);
      const lineHeight = fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      let y = height / 2 - totalHeight / 2;

      for (const line of lines) {
        ctx.fillText(line, width / 2, y);
        y += lineHeight;
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load template image"));
    };

    img.src = templateUrl;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}