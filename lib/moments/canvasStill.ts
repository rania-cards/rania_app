import { STILL_TEMPLATES, StillTemplateId } from "./templates";

export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
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
};

export const renderStillImage = async (
  templateId: StillTemplateId,
  message: string,
  sender?: string,
  overrideImageUrl?: string
): Promise<string> => {
  const template = STILL_TEMPLATES[templateId];

  // Slightly smaller canvas for performance but still HD-like
  const width = 720;
  const height = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const img = new Image();
  img.crossOrigin = "anonymous";

  const imageUrl =
    overrideImageUrl || template?.imageUrl || overrideImageUrl || "";

  if (!imageUrl) throw new Error("Missing image URL");

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      if (template?.gradient) {
        ctx.fillStyle = template.gradient;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, width, height);
      }

      const style = template?.textStyle ?? {
        fontSize: 56,
        fontWeight: "700" as const,
        color: "#ffffff",
        shadowColor: "rgba(0,0,0,0.8)",
        shadowBlur: 24,
      };

      ctx.fillStyle = style.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.font = `${style.fontWeight} ${style.fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

      const lines = wrapText(ctx, message, width * 0.82);
      const lineHeight = style.fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      let y = height / 2 - totalHeight / 2;

      for (const line of lines) {
        ctx.fillText(line, width / 2, y);
        y += lineHeight;
      }

      if (sender) {
        ctx.font = `400 ${style.fontSize * 0.5}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.globalAlpha = 0.95;
        ctx.fillText(`— ${sender}`, width / 2, height - 100);
        ctx.globalAlpha = 1;
      }

      resolve(canvas.toDataURL("image/png", 0.9));
    };

    img.onerror = () => reject(new Error("Failed to load template image"));
    img.src = imageUrl;
  });
};