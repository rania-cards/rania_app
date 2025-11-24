// lib/designSystem.ts - Advanced Design System for RANIA

// ===== FONT FAMILIES =====
export type FontFamily = 
  | "sans" | "serif" | "mono" | "display" | "handwriting"
  | "elegant" | "modern" | "bold" | "light" | "playful";

export const FONTS: Record<FontFamily, { name: string; family: string }> = {
  sans: {
    name: "Clean Sans",
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  serif: {
    name: "Classic Serif",
    family: "'Georgia', 'Garamond', serif",
  },
  mono: {
    name: "Mono Code",
    family: "'Courier New', 'Monaco', monospace",
  },
  display: {
    name: "Display Bold",
    family: "'Impact', 'Arial Black', sans-serif",
  },
  handwriting: {
    name: "Handwriting",
    family: "'Brush Script MT', 'Lucida Calligraphy', cursive",
  },
  elegant: {
    name: "Elegant Thin",
    family: "'Optima', 'Palatino', serif",
  },
  modern: {
    name: "Modern Geometric",
    family: "'Futura', 'Trebuchet MS', sans-serif",
  },
  bold: {
    name: "Heavy Bold",
    family: "'Arial', 'Helvetica', sans-serif",
  },
  light: {
    name: "Light Subtle",
    family: "'Segoe UI Light', 'Helvetica Neue', sans-serif",
  },
  playful: {
    name: "Playful Comic",
    family: "'Comic Sans MS', 'Trebuchet MS', cursive",
  },
};

// ===== TEXT COLORS =====
export type TextColorId = 
  | "white" | "black" | "gold" | "silver" | "rose" | "emerald" | "sky"
  | "coral" | "purple" | "yellow" | "cyan" | "pink" | "mint" | "orange";

export const TEXT_COLORS: Record<TextColorId, { name: string; hex: string; shadow: string }> = {
  white: { name: "Pure White", hex: "#ffffff", shadow: "rgba(0, 0, 0, 0.7)" },
  black: { name: "Deep Black", hex: "#000000", shadow: "rgba(255, 255, 255, 0.5)" },
  gold: { name: "Luxury Gold", hex: "#fbbf24", shadow: "rgba(78, 22, 9, 0.8)" },
  silver: { name: "Silver", hex: "#e5e7eb", shadow: "rgba(0, 0, 0, 0.6)" },
  rose: { name: "Soft Rose", hex: "#fce7f3", shadow: "rgba(190, 24, 93, 0.7)" },
  emerald: { name: "Emerald", hex: "#ecfdf5", shadow: "rgba(5, 46, 22, 0.8)" },
  sky: { name: "Sky Blue", hex: "#e0f2ff", shadow: "rgba(0, 30, 60, 0.7)" },
  coral: { name: "Coral", hex: "#fed7aa", shadow: "rgba(127, 29, 29, 0.7)" },
  purple: { name: "Amethyst", hex: "#f5f3ff", shadow: "rgba(88, 28, 135, 0.7)" },
  yellow: { name: "Golden Yellow", hex: "#fef3c7", shadow: "rgba(120, 53, 15, 0.7)" },
  cyan: { name: "Cyan", hex: "#cffafe", shadow: "rgba(0, 51, 102, 0.7)" },
  pink: { name: "Hot Pink", hex: "#fecdd3", shadow: "rgba(153, 0, 76, 0.8)" },
  mint: { name: "Fresh Mint", hex: "#d1fae5", shadow: "rgba(5, 46, 22, 0.8)" },
  orange: { name: "Vibrant Orange", hex: "#ffedd5", shadow: "rgba(124, 45, 18, 0.7)" },
};

// ===== EXPANDED STILL TEMPLATES (20 Total) =====
export type StillTemplateId = 
  | "sunset" | "midnight" | "golden" | "ocean" | "forest" | "neon"
  | "rose" | "sky" | "lavender" | "coral" | "emerald" | "slate"
  | "marble" | "velvet" | "autumn" | "winter" | "spring" | "summer"
  | "cosmic" | "fire";

export interface StillTemplate {
  id: StillTemplateId;
  name: string;
  imageUrl: string;
  gradient?: string;
}

export const STILL_TEMPLATES: Record<StillTemplateId, StillTemplate> = {
  // Original 12
  sunset: {
    id: "sunset",
    name: "🌅 Warm Sunset",
    imageUrl: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1080&h=1920&fit=crop&q=85",
  },
  midnight: {
    id: "midnight",
    name: "🌙 Deep Midnight",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop&q=85",
  },
  golden: {
    id: "golden",
    name: "✨ Golden Hour",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop&q=85",
  },
  ocean: {
    id: "ocean",
    name: "🌊 Ocean Blue",
    imageUrl: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&h=1920&fit=crop&q=85",
  },
  forest: {
    id: "forest",
    name: "🌲 Forest Green",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1920&fit=crop&q=85",
  },
  neon: {
    id: "neon",
    name: "💜 Neon Nights",
    imageUrl: "https://images.unsplash.com/photo-1514306688772-aadfc4d4b5f3?w=1080&h=1920&fit=crop&q=85",
  },
  rose: {
    id: "rose",
    name: "🌹 Rose Pink",
    imageUrl: "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1080&h=1920&fit=crop&q=85",
  },
  sky: {
    id: "sky",
    name: "☁️ Clear Sky",
    imageUrl: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1080&h=1920&fit=crop&q=85",
  },
  lavender: {
    id: "lavender",
    name: "💜 Lavender Dream",
    imageUrl: "https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=1080&h=1920&fit=crop&q=85",
  },
  coral: {
    id: "coral",
    name: "🪸 Coral Reef",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&h=1920&fit=crop&q=85",
  },
  emerald: {
    id: "emerald",
    name: "💚 Emerald Glow",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1080&h=1920&fit=crop&q=85",
  },
  slate: {
    id: "slate",
    name: "🎭 Dark Slate",
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1080&h=1920&fit=crop&q=85",
  },

  // New 8 Templates
  marble: {
    id: "marble",
    name: "🤍 White Marble",
    imageUrl: "https://images.unsplash.com/photo-1578926078328-123f5474f1cb?w=1080&h=1920&fit=crop&q=85",
  },
  velvet: {
    id: "velvet",
    name: "💎 Deep Velvet",
    imageUrl: "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=1080&h=1920&fit=crop&q=85",
  },
  autumn: {
    id: "autumn",
    name: "🍂 Autumn Leaves",
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080&h=1920&fit=crop&q=85",
  },
  winter: {
    id: "winter",
    name: "❄️ Snowy Winter",
    imageUrl: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5d0?w=1080&h=1920&fit=crop&q=85",
  },
  spring: {
    id: "spring",
    name: "🌸 Spring Bloom",
    imageUrl: "https://images.unsplash.com/photo-1520763185298-1b434c919abe?w=1080&h=1920&fit=crop&q=85",
  },
  summer: {
    id: "summer",
    name: "☀️ Summer Vibes",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1080&h=1920&fit=crop&q=85",
  },
  cosmic: {
    id: "cosmic",
    name: "🌌 Cosmic Space",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop&q=85",
  },
  fire: {
    id: "fire",
    name: "🔥 Burning Fire",
    imageUrl: "https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=1080&h=1920&fit=crop&q=85",
  },
};

// ===== EXPANDED GIF PACKS (20 Total) =====
export type GifPackId = 
  | "hearts" | "sparkles" | "confetti" | "waves" | "gradient"
  | "fire" | "rain" | "stars" | "butterflies" | "aurora"
  | "cherry_blossom" | "cosmic" | "lightning" | "bubbles" | "rainbow"
  | "snow" | "smoke" | "particles" | "glitch" | "neon_glow";

export interface GifPack {
  id: GifPackId;
  name: string;
  gifUrls: [string, string, string];
  colors: [string, string, string];
}

export const GIF_PACKS: GifPack[] = [
  // Original 12
  { id: "hearts", name: "❤️ Hearts", gifUrls: ["https://media.giphy.com/media/l0HlNaQ9hWVo0XO1i/giphy.gif", "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", "https://media.giphy.com/media/g9GUusdmD4H0E6dXX8/giphy.gif"], colors: ["#ff1744", "#ff6b6b", "#ff9999"] },
  { id: "sparkles", name: "✨ Sparkles", gifUrls: ["https://media.giphy.com/media/l0HlQaQ00QCw1G4jK/giphy.gif", "https://media.giphy.com/media/3o7TKU2VeEiRVr7Sxy/giphy.gif", "https://media.giphy.com/media/l46Cy1rHbQ92c0LMA/giphy.gif"], colors: ["#fbbf24", "#fcd34d", "#fef3c7"] },
  { id: "confetti", name: "🎉 Confetti", gifUrls: ["https://media.giphy.com/media/l0HlHJJxhN9H2XO1i/giphy.gif", "https://media.giphy.com/media/xT9IgEx8SbQ2C3LFWQ/giphy.gif", "https://media.giphy.com/media/3o6ZtpWLqcJBCutmUE/giphy.gif"], colors: ["#ec4899", "#8b5cf6", "#0ea5e9"] },
  { id: "waves", name: "🌊 Waves", gifUrls: ["https://media.giphy.com/media/l0HlDy9x8FZo0XO1i/giphy.gif", "https://media.giphy.com/media/l0HlH6YNpLj1FF0Jq/giphy.gif", "https://media.giphy.com/media/l0HlMZWozKopDfzS8/giphy.gif"], colors: ["#0ea5e9", "#06b6d4", "#14b8a6"] },
  { id: "gradient", name: "🌈 Gradient", gifUrls: ["https://media.giphy.com/media/l0HlPQg2kn92UsJLi/giphy.gif", "https://media.giphy.com/media/l0HlSBCjZc7e0XO1i/giphy.gif", "https://media.giphy.com/media/l0HlFXriQay0eO81i/giphy.gif"], colors: ["#ff00ff", "#00ffff", "#ffff00"] },
  { id: "fire", name: "🔥 Fire", gifUrls: ["https://media.giphy.com/media/VHW0X0GEQvqt7J7KT5/giphy.gif", "https://media.giphy.com/media/l0HlMXi9YNCw0XO1i/giphy.gif", "https://media.giphy.com/media/3o7TKLd6E3tZYPQe7u/giphy.gif"], colors: ["#ff4500", "#ff6347", "#ffa500"] },
  { id: "rain", name: "🌧️ Rain", gifUrls: ["https://media.giphy.com/media/3ohzdKz6XZmPUmVDle/giphy.gif", "https://media.giphy.com/media/l0HlRnzwmN6FqCUWA/giphy.gif", "https://media.giphy.com/media/l0HlQeQ8LoeFVoXXi/giphy.gif"], colors: ["#4b5563", "#6c757d", "#a8adba"] },
  { id: "stars", name: "⭐ Stars", gifUrls: ["https://media.giphy.com/media/l0HlFMaQ90Nzc3gVG/giphy.gif", "https://media.giphy.com/media/l0HlGVBYKJ7D3xhZa/giphy.gif", "https://media.giphy.com/media/l0HlP0l1dZXMOxqP6/giphy.gif"], colors: ["#1a1f36", "#2d3561", "#ffd700"] },
  { id: "butterflies", name: "🦋 Butterflies", gifUrls: ["https://media.giphy.com/media/l0HlYbYXJ4w0XO1gA/giphy.gif", "https://media.giphy.com/media/l0HlQfWXZxDqSBpMI/giphy.gif", "https://media.giphy.com/media/l0HlH7xqfcNb0AsTa/giphy.gif"], colors: ["#ff69b4", "#ffb6d9", "#ffc0cb"] },
  { id: "aurora", name: "🌌 Aurora", gifUrls: ["https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", "https://media.giphy.com/media/l0HlSqCn9hWE9m5kQ/giphy.gif", "https://media.giphy.com/media/l0HlFVo7cHd0phFtW/giphy.gif"], colors: ["#00ff00", "#00ffff", "#ff00ff"] },
  { id: "cherry_blossom", name: "🌸 Cherry", gifUrls: ["https://media.giphy.com/media/l0HlPXhYL8cSh5jrG/giphy.gif", "https://media.giphy.com/media/l0HlMZWozKopDfzS8/giphy.gif", "https://media.giphy.com/media/3o7TKXbcUoKROjYYKA/giphy.gif"], colors: ["#ffb7c5", "#ff69b4", "#ffc0cb"] },
  { id: "cosmic", name: "🌀 Cosmic", gifUrls: ["https://media.giphy.com/media/l0MYGb1LuZ3n7MuL2/giphy.gif", "https://media.giphy.com/media/l0HlOXpqeGHEWj0aQa/giphy.gif", "https://media.giphy.com/media/l0HlSrEKYyUFCBEMmu/giphy.gif"], colors: ["#6a0dad", "#9400d3", "#ff00ff"] },

  // New 8 Packs
  { id: "lightning", name: "⚡ Lightning", gifUrls: ["https://media.giphy.com/media/3o6ZtpWLqcJBCutmUE/giphy.gif", "https://media.giphy.com/media/xT9IgEx8SbQ2C3LFWQ/giphy.gif", "https://media.giphy.com/media/l0HlHJJxhN9H2XO1i/giphy.gif"], colors: ["#ffff00", "#ffcc00", "#ff9900"] },
  { id: "bubbles", name: "🫧 Bubbles", gifUrls: ["https://media.giphy.com/media/l0HlM5gdUN6jwXP4I/giphy.gif", "https://media.giphy.com/media/l0HlGVBYKJ7D3xhZa/giphy.gif", "https://media.giphy.com/media/l0HlRnzwmN6FqCUWA/giphy.gif"], colors: ["#87ceeb", "#b0e0e6", "#add8e6"] },
  { id: "rainbow", name: "🌈 Rainbow", gifUrls: ["https://media.giphy.com/media/l0HlSCY0My7f5ELD6/giphy.gif", "https://media.giphy.com/media/l0HlFXriQay0eO81i/giphy.gif", "https://media.giphy.com/media/l0HlPQg2kn92UsJLi/giphy.gif"], colors: ["#ff0000", "#00ff00", "#0000ff"] },
  { id: "snow", name: "❄️ Snow", gifUrls: ["https://media.giphy.com/media/l0HlK1UcgWWEYEPyM/giphy.gif", "https://media.giphy.com/media/l0HlNpQ8wr63wWaeY/giphy.gif", "https://media.giphy.com/media/l0HlNaQ9hWVo0XO1i/giphy.gif"], colors: ["#ffffff", "#e0f2ff", "#b0e0e6"] },
  { id: "smoke", name: "💨 Smoke", gifUrls: ["https://media.giphy.com/media/l0HlPDtIHWNuC9viI/giphy.gif", "https://media.giphy.com/media/l0HlGVBYKJ7D3xhZa/giphy.gif", "https://media.giphy.com/media/l0HlRnzwmN6FqCUWA/giphy.gif"], colors: ["#808080", "#a9a9a9", "#c0c0c0"] },
  { id: "particles", name: "✨ Particles", gifUrls: ["https://media.giphy.com/media/l0HlQaQ00QCw1G4jK/giphy.gif", "https://media.giphy.com/media/3o7TKU2VeEiRVr7Sxy/giphy.gif", "https://media.giphy.com/media/l46Cy1rHbQ92c0LMA/giphy.gif"], colors: ["#fbbf24", "#fcd34d", "#fef3c7"] },
  { id: "glitch", name: "🔴 Glitch", gifUrls: ["https://media.giphy.com/media/l0HlM5gdUN6jwXP4I/giphy.gif", "https://media.giphy.com/media/l0HlGVBYKJ7D3xhZa/giphy.gif", "https://media.giphy.com/media/l0HlRnzwmN6FqCUWA/giphy.gif"], colors: ["#ff0080", "#ff0040", "#ff00ff"] },
  { id: "neon_glow", name: "💜 Neon", gifUrls: ["https://media.giphy.com/media/3o6ZtpWLqcJBCutmUE/giphy.gif", "https://media.giphy.com/media/xT9IgEx8SbQ2C3LFWQ/giphy.gif", "https://media.giphy.com/media/l0HlHJJxhN9H2XO1i/giphy.gif"], colors: ["#ff006e", "#8338ec", "#3a86ff"] },
];

// ===== HELPER FUNCTIONS =====
export function getAllTemplates() {
  return Object.values(STILL_TEMPLATES);
}

export function getAllGifPacks() {
  return GIF_PACKS;
}

export function getTemplate(id: StillTemplateId) {
  return STILL_TEMPLATES[id];
}

export function getGifPack(id: GifPackId) {
  return GIF_PACKS.find((p) => p.id === id);
}

export function getFont(id: FontFamily) {
  return FONTS[id];
}

export function getTextColor(id: TextColorId) {
  return TEXT_COLORS[id];
}