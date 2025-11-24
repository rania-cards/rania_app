// lib/momentRenderer.ts - EXPANDED VERSION

export type StillTemplateId = 
  | "sunset" | "midnight" | "golden" | "ocean" | "forest" | "neon"
  | "rose" | "sky" | "lavender" | "coral" | "emerald" | "slate";

export type GifPackId = 
  | "hearts" | "sparkles" | "confetti" | "waves" | "gradient"
  | "fire" | "rain" | "stars" | "butterflies" | "aurora" | "cherry_blossom" | "cosmic";

export interface TextStyle {
  fontSize: number;
  fontWeight: "400" | "600" | "700" | "800";
  color: string;
  shadowColor: string;
  shadowBlur: number;
}

export interface StillTemplate {
  id: StillTemplateId;
  name: string;
  imageUrl: string;
  gradient?: string;
  textStyle: TextStyle;
}

export interface GifPack {
  id: GifPackId;
  name: string;
  gifUrls: [string, string, string];
  colors: string[];
}

// ===== EXPANDED STILL TEMPLATES (12 Total) =====
export const STILL_TEMPLATES: Record<StillTemplateId, StillTemplate> = {
  // Original 6
  sunset: {
    id: "sunset",
    name: "🌅 Warm Sunset",
    imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(139, 69, 19, 0.6)",
      shadowBlur: 20,
    },
  },
  midnight: {
    id: "midnight",
    name: "🌙 Deep Midnight",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#e0f2ff",
      shadowColor: "rgba(0, 20, 60, 0.8)",
      shadowBlur: 25,
    },
  },
  golden: {
    id: "golden",
    name: "✨ Golden Hour",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#fef3c7",
      shadowColor: "rgba(78, 22, 9, 0.7)",
      shadowBlur: 20,
    },
  },
  ocean: {
    id: "ocean",
    name: "🌊 Ocean Blue",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(0, 30, 60, 0.7)",
      shadowBlur: 25,
    },
  },
  forest: {
    id: "forest",
    name: "🌲 Forest Green",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ecfdf5",
      shadowColor: "rgba(5, 46, 22, 0.8)",
      shadowBlur: 25,
    },
  },
  neon: {
    id: "neon",
    name: "💜 Neon Nights",
    imageUrl: "https://images.unsplash.com/photo-1514306688772-aadfc4d4b5f3?w=1080&h=1920&fit=crop&q=85",
    gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))",
    textStyle: {
      fontSize: 56,
      fontWeight: "800",
      color: "#fbbf24",
      shadowColor: "rgba(139, 92, 246, 0.8)",
      shadowBlur: 30,
    },
  },

  // New 6 Templates
  rose: {
    id: "rose",
    name: "🌹 Rose Pink",
    imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#fce7f3",
      shadowColor: "rgba(190, 24, 93, 0.7)",
      shadowBlur: 22,
    },
  },
  sky: {
    id: "sky",
    name: "☁️ Clear Sky",
    imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(30, 58, 138, 0.6)",
      shadowBlur: 20,
    },
  },
  lavender: {
    id: "lavender",
    name: "💜 Lavender Dream",
    imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#f5f3ff",
      shadowColor: "rgba(88, 28, 135, 0.7)",
      shadowBlur: 23,
    },
  },
  coral: {
    id: "coral",
    name: "🪸 Coral Reef",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(127, 29, 29, 0.7)",
      shadowBlur: 24,
    },
  },
  emerald: {
    id: "emerald",
    name: "💚 Emerald Glow",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ecfdf5",
      shadowColor: "rgba(4, 120, 87, 0.8)",
      shadowBlur: 25,
    },
  },
  slate: {
    id: "slate",
    name: "🎭 Dark Slate",
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#f1f5f9",
      shadowColor: "rgba(15, 23, 42, 0.9)",
      shadowBlur: 22,
    },
  },
};

// ===== EXPANDED GIF PACKS (12 Total) =====
export const GIF_PACKS: GifPack[] = [
  // Original 5
  {
    id: "hearts",
    name: "❤️ Hearts Pack",
    gifUrls: [
      "https://media.giphy.com/media/l0HlNaQ9hWVo0XO1i/giphy.gif",
      "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
      "https://media.giphy.com/media/g9GUusdmD4H0E6dXX8/giphy.gif",
    ],
    colors: ["#ff1744", "#ff6b6b", "#ff9999"],
  },
  {
    id: "sparkles",
    name: "✨ Sparkles Pack",
    gifUrls: [
      "https://media.giphy.com/media/l0HlQaQ00QCw1G4jK/giphy.gif",
      "https://media.giphy.com/media/3o7TKU2VeEiRVr7Sxy/giphy.gif",
      "https://media.giphy.com/media/l46Cy1rHbQ92c0LMA/giphy.gif",
    ],
    colors: ["#fbbf24", "#fcd34d", "#fef3c7"],
  },
  {
    id: "confetti",
    name: "🎉 Confetti Pack",
    gifUrls: [
      "https://media.giphy.com/media/l0HlHJJxhN9H2XO1i/giphy.gif",
      "https://media.giphy.com/media/xT9IgEx8SbQ2C3LFWQ/giphy.gif",
      "https://media.giphy.com/media/3o6ZtpWLqcJBCutmUE/giphy.gif",
    ],
    colors: ["#ec4899", "#8b5cf6", "#0ea5e9"],
  },
  {
    id: "waves",
    name: "🌊 Wave Pack",
    gifUrls: [
      "https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif",
      "https://media.giphy.com/media/l0HlH6YNpLj1FF0Jq/giphy.gif",
      "https://media.giphy.com/media/l0HlMZWozKopDfzS8/giphy.gif",
    ],
    colors: ["#0ea5e9", "#06b6d4", "#14b8a6"],
  },
  {
    id: "gradient",
    name: "🌈 Gradient Pack",
    gifUrls: [
      "https://media.giphy.com/media/l0HlPQg2kn92UsJLi/giphy.gif",
      "https://media.giphy.com/media/l0HlSBCjZc7e0XO1i/giphy.gif",
      "https://media.giphy.com/media/l0HlFXriQay0eO81i/giphy.gif",
    ],
    colors: ["#ff00ff", "#00ffff", "#ffff00"],
  },

  // New 7 Packs
  {
    id: "fire",
    name: "🔥 Fire Flames",
    gifUrls: [
      "https://media.giphy.com/media/VHW0X0GEQvqt7J7KT5/giphy.gif",
      "https://media.giphy.com/media/l0HlMXi9YNCw0XO1i/giphy.gif",
      "https://media.giphy.com/media/3o7TKLd6E3tZYPQe7u/giphy.gif",
    ],
    colors: ["#ff4500", "#ff6347", "#ffa500"],
  },
  {
    id: "rain",
    name: "🌧️ Rainy Day",
    gifUrls: [
      "https://media.giphy.com/media/3ohzdKz6XZmPUmVDle/giphy.gif",
      "https://media.giphy.com/media/l0HlRnzwmN6FqCUWA/giphy.gif",
      "https://media.giphy.com/media/l0HlQeQ8LoeFVoXXi/giphy.gif",
    ],
    colors: ["#4b5563", "#6c757d", "#a8adba"],
  },
  {
    id: "stars",
    name: "⭐ Starry Night",
    gifUrls: [
      "https://media.giphy.com/media/l0HlFMaQ90Nzc3gVG/giphy.gif",
      "https://media.giphy.com/media/l0HlGVBYKJ7D3xhZa/giphy.gif",
      "https://media.giphy.com/media/l0HlP0l1dZXMOxqP6/giphy.gif",
    ],
    colors: ["#1a1f36", "#2d3561", "#ffd700"],
  },
  {
    id: "butterflies",
    name: "🦋 Butterflies",
    gifUrls: [
      "https://media.giphy.com/media/l0HlYbYXJ4w0XO1gA/giphy.gif",
      "https://media.giphy.com/media/l0HlQfWXZxDqSBpMI/giphy.gif",
      "https://media.giphy.com/media/l0HlH7xqfcNb0AsTa/giphy.gif",
    ],
    colors: ["#ff69b4", "#ffb6d9", "#ffc0cb"],
  },
  {
    id: "aurora",
    name: "🌌 Aurora Borealis",
    gifUrls: [
      "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
      "https://media.giphy.com/media/l0HlSqCn9hWE9m5kQ/giphy.gif",
      "https://media.giphy.com/media/l0HlFVo7cHd0phFtW/giphy.gif",
    ],
    colors: ["#00ff00", "#00ffff", "#ff00ff"],
  },
  {
    id: "cherry_blossom",
    name: "🌸 Cherry Blossom",
    gifUrls: [
      "https://media.giphy.com/media/l0HlPXhYL8cSh5jrG/giphy.gif",
      "https://media.giphy.com/media/l0HlMZWozKopDfzS8/giphy.gif",
      "https://media.giphy.com/media/3o7TKXbcUoKROjYYKA/giphy.gif",
    ],
    colors: ["#ffb7c5", "#ff69b4", "#ffc0cb"],
  },
  {
    id: "cosmic",
    name: "🌀 Cosmic Swirl",
    gifUrls: [
      "https://media.giphy.com/media/l0MYGb1LuZ3n7MuL2/giphy.gif",
      "https://media.giphy.com/media/l0HlOXpqeGHEWj0aQa/giphy.gif",
      "https://media.giphy.com/media/l0HlSrEKYyUFCBEMmu/giphy.gif",
    ],
    colors: ["#6a0dad", "#9400d3", "#ff00ff"],
  },
];

// ===== HELPER FUNCTIONS =====

export function getAllTemplates(): StillTemplate[] {
  return Object.values(STILL_TEMPLATES);
}

export function getAllGifPacks(): GifPack[] {
  return GIF_PACKS;
}

export function getTemplate(id: StillTemplateId): StillTemplate | undefined {
  return STILL_TEMPLATES[id];
}

export function getGifPack(id: GifPackId): GifPack | undefined {
  return GIF_PACKS.find((p) => p.id === id);
}

// ===== RENDERING FUNCTIONS (Same as before) =====

export async function renderStillImage(
  templateId: StillTemplateId,
  message: string,
  senderName?: string
): Promise<string> {
  const template = STILL_TEMPLATES[templateId];
  if (!template) throw new Error("Invalid template");

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      if (template.gradient) {
        ctx.fillStyle = template.gradient;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, width, height);
      }

      const style = template.textStyle;
      ctx.fillStyle = style.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.font = `${style.fontWeight} ${style.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      const lines = wrapText(ctx, message, width * 0.85);
      const lineHeight = style.fontSize * 1.5;
      const totalHeight = lines.length * lineHeight;
      let y = height / 2 - totalHeight / 2;

      for (const line of lines) {
        ctx.fillText(line, width / 2, y);
        y += lineHeight;
      }

      if (senderName) {
        ctx.font = `400 ${style.fontSize * 0.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = style.color;
        ctx.globalAlpha = 0.8;
        ctx.fillText(`— ${senderName}`, width / 2, height - 120);
        ctx.globalAlpha = 1;
      }

      const dataUrl = canvas.toDataURL("image/png", 0.95);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load template image"));
    img.src = template.imageUrl;
  });
}

export async function generateGifMomentPreview(
  gifPackId: GifPackId,
  message: string,
  senderName?: string
): Promise<string> {
  const gifPack = GIF_PACKS.find((p) => p.id === gifPackId);
  if (!gifPack) throw new Error("Invalid GIF pack");

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const colors = gifPack.colors;
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 25;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.font = "800 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const lines = wrapText(ctx, message, width * 0.85);
  const lineHeight = 84;
  const totalHeight = lines.length * lineHeight;
  let y = height / 2 - totalHeight / 2;

  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  if (senderName) {
    ctx.font = "400 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.9;
    ctx.fillText(`— ${senderName}`, width / 2, height - 120);
    ctx.globalAlpha = 1;
  }

  return canvas.toDataURL("image/png", 0.95);
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