export type DeliveryType =
  | "text"
  | "user_voice"
  | "user_video"
  | "kid_voice"
  | "kid_video";

export type TemplateCategory =
  | "love"
  | "apology"
  | "new_born"
  | "wedding_anniversary"
  | "condolences"
  | "get_well"
  | "others";

export type TemplateStyle = {
  id: string;
  category: TemplateCategory;
  name: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string; // emoji or short label
  description: string;
};

// LOVE (5)
const LOVE_TEMPLATES: TemplateStyle[] = [
  {
    id: "love-soft-sunset",
    category: "love",
    name: "Soft Sunset",
    gradientFrom: "#fb7185", // pink-400
    gradientTo: "#f97316", // orange-500
    icon: "💖",
    description: "Warm, glowy colours for soft, romantic moments.",
  },
  {
    id: "love-deep-rose",
    category: "love",
    name: "Deep Rose",
    gradientFrom: "#be123c", // rose-700
    gradientTo: "#4c0519", // rose-950
    icon: "🌹",
    description: "Rich rose tones for deep love declarations.",
  },
  {
    id: "love-golden-hug",
    category: "love",
    name: "Golden Hug",
    gradientFrom: "#facc15", // yellow-400
    gradientTo: "#f97316", // orange-500
    icon: "🤗",
    description: "Golden warmth for grateful, hug-style messages.",
  },
  {
    id: "love-midnight-stars",
    category: "love",
    name: "Midnight Stars",
    gradientFrom: "#020617", // slate-950
    gradientTo: "#1e293b", // slate-800
    icon: "✨",
    description: "Dark sky with tiny star vibes for night-time moments.",
  },
  {
    id: "love-soft-lilac",
    category: "love",
    name: "Soft Lilac",
    gradientFrom: "#a855f7", // purple-500
    gradientTo: "#4c1d95", // violet-900
    icon: "💜",
    description: "Gentle purple tones for calm, steady love.",
  },
];

// APOLOGY (5)
const APOLOGY_TEMPLATES: TemplateStyle[] = [
  {
    id: "apology-soft-blue",
    category: "apology",
    name: "Soft Blue",
    gradientFrom: "#38bdf8", // sky-400
    gradientTo: "#0f172a", // slate-900
    icon: "😔",
    description: "Gentle blue for honest, calm apologies.",
  },
  {
    id: "apology-warm-olive",
    category: "apology",
    name: "Warm Olive",
    gradientFrom: "#16a34a", // green-600
    gradientTo: "#022c22", // emerald-950
    icon: "🫒",
    description: "Grounded greens for making peace again.",
  },
  {
    id: "apology-soft-grey",
    category: "apology",
    name: "Soft Grey",
    gradientFrom: "#64748b", // slate-500
    gradientTo: "#020617", // slate-950
    icon: "💬",
    description: "Neutral tone that keeps focus on your words.",
  },
  {
    id: "apology-rose-glow",
    category: "apology",
    name: "Rose Glow",
    gradientFrom: "#fb7185", // rose-400
    gradientTo: "#1f2937", // gray-800
    icon: "🕊️",
    description: "Softer pink-red to say 'I’m really trying' without drama.",
  },
  {
    id: "apology-amber-bridge",
    category: "apology",
    name: "Amber Bridge",
    gradientFrom: "#f59e0b", // amber-500
    gradientTo: "#78350f", // amber-900
    icon: "🌉",
    description: "Warm amber to symbolize building a bridge again.",
  },
];

// NEW BORN (5)
const NEW_BORN_TEMPLATES: TemplateStyle[] = [
  {
    id: "newborn-soft-clouds",
    category: "new_born",
    name: "Soft Clouds",
    gradientFrom: "#e0f2fe", // sky-100
    gradientTo: "#38bdf8", // sky-400
    icon: "☁️",
    description: "Light blue and white for dreamy baby vibes.",
  },
  {
    id: "newborn-blanket-pink",
    category: "new_born",
    name: "Blanket Pink",
    gradientFrom: "#f9a8d4", // pink-300
    gradientTo: "#f472b6", // pink-400
    icon: "🍼",
    description: "Soft pink like a tiny baby blanket.",
  },
  {
    id: "newborn-little-star",
    category: "new_born",
    name: "Little Star",
    gradientFrom: "#facc15", // yellow-400
    gradientTo: "#22c55e", // green-500
    icon: "⭐",
    description: "Cheerful yellow & green for 'welcome to the world' moments.",
  },
  {
    id: "newborn-mint-fresh",
    category: "new_born",
    name: "Mint Fresh",
    gradientFrom: "#6ee7b7", // emerald-300
    gradientTo: "#047857", // emerald-700
    icon: "🌱",
    description: "Fresh greens for new life, new beginnings.",
  },
  {
    id: "newborn-cotton-sky",
    category: "new_born",
    name: "Cotton Sky",
    gradientFrom: "#fde68a", // amber-200
    gradientTo: "#38bdf8", // sky-400
    icon: "🎀",
    description: "Soft pastel blend for baby announcements & joy.",
  },
];

// WEDDING & ANNIVERSARY (5)
const WEDDING_TEMPLATES: TemplateStyle[] = [
  {
    id: "wedding-cream-gold",
    category: "wedding_anniversary",
    name: "Cream & Gold",
    gradientFrom: "#fef9c3", // yellow-100
    gradientTo: "#facc15", // yellow-400
    icon: "💍",
    description: "Elegant gold tones for big promises and memories.",
  },
  {
    id: "wedding-midnight-gold",
    category: "wedding_anniversary",
    name: "Midnight Gold",
    gradientFrom: "#020617", // slate-950
    gradientTo: "#fbbf24", // amber-400
    icon: "🌙",
    description: "Dark base with gold sparks for classy night moments.",
  },
  {
    id: "wedding-soft-lavender",
    category: "wedding_anniversary",
    name: "Soft Lavender",
    gradientFrom: "#e9d5ff", // purple-100
    gradientTo: "#7c3aed", // purple-600
    icon: "💐",
    description: "Delicate florals for gentle anniversary notes.",
  },
  {
    id: "wedding-champagne",
    category: "wedding_anniversary",
    name: "Champagne Glow",
    gradientFrom: "#f5f5f4", // stone-100
    gradientTo: "#d4d4d4", // neutral-300
    icon: "🥂",
    description: "Neutral champagne tones for timeless messages.",
  },
  {
    id: "wedding-rose-garden",
    category: "wedding_anniversary",
    name: "Rose Garden",
    gradientFrom: "#fb7185", // rose-400
    gradientTo: "#166534", // green-700
    icon: "🌺",
    description: "Romantic rose + green combo for long love stories.",
  },
];

// CONDOLENCES (5)
const CONDOLENCE_TEMPLATES: TemplateStyle[] = [
  {
    id: "condolence-soft-grey",
    category: "condolences",
    name: "Soft Grey",
    gradientFrom: "#e5e7eb", // gray-200
    gradientTo: "#4b5563", // gray-600
    icon: "🕊️",
    description: "Soft neutrals for gentle support and sympathy.",
  },
  {
    id: "condolence-deep-navy",
    category: "condolences",
    name: "Deep Navy",
    gradientFrom: "#020617", // slate-950
    gradientTo: "#1e293b", // slate-800
    icon: "🌌",
    description: "Deep blues for respectful, quiet messages.",
  },
  {
    id: "condolence-olive-calm",
    category: "condolences",
    name: "Olive Calm",
    gradientFrom: "#15803d", // green-700
    gradientTo: "#022c22", // emerald-950
    icon: "🌿",
    description: "Muted greens for comforting, grounded words.",
  },
  {
    id: "condolence-soft-sand",
    category: "condolences",
    name: "Soft Sand",
    gradientFrom: "#f5f5f4", // stone-100
    gradientTo: "#78716c", // stone-500
    icon: "🏜️",
    description: "Earthy neutrals for reflective, calm condolences.",
  },
  {
    id: "condolence-dawn-blue",
    category: "condolences",
    name: "Dawn Blue",
    gradientFrom: "#bfdbfe", // blue-200
    gradientTo: "#1d4ed8", // blue-700
    icon: "🌅",
    description: "Soft light breaking into blue, symbolizing hope.",
  },
];

// GET WELL SOON (5)
const GETWELL_TEMPLATES: TemplateStyle[] = [
  {
    id: "getwell-fresh-mint",
    category: "get_well",
    name: "Fresh Mint",
    gradientFrom: "#a7f3d0", // emerald-200
    gradientTo: "#10b981", // emerald-500
    icon: "🍃",
    description: "Fresh greens for 'you’ll be okay' energy.",
  },
  {
    id: "getwell-sunny-day",
    category: "get_well",
    name: "Sunny Day",
    gradientFrom: "#fef08a", // yellow-200
    gradientTo: "#22c55e", // green-500
    icon: "☀️",
    description: "Yellow and green to send warmth and strength.",
  },
  {
    id: "getwell-soft-peach",
    category: "get_well",
    name: "Soft Peach",
    gradientFrom: "#fed7aa", // orange-200
    gradientTo: "#f97316", // orange-500
    icon: "🍑",
    description: "Gentle peachy tones for sweet recovery wishes.",
  },
  {
    id: "getwell-sky-bounce",
    category: "get_well",
    name: "Sky Bounce",
    gradientFrom: "#bae6fd", // sky-200
    gradientTo: "#0ea5e9", // sky-500
    icon: "🏀",
    description: "Energetic blues for 'you’ll bounce back' energy.",
  },
  {
    id: "getwell-tea-time",
    category: "get_well",
    name: "Tea Time",
    gradientFrom: "#bbf7d0", // green-200
    gradientTo: "#713f12", // amber-900
    icon: "🍵",
    description: "Comforting palette for cozy, caring messages.",
  },
];

// OTHERS (5)
const OTHER_TEMPLATES: TemplateStyle[] = [
  {
    id: "others-playful-confetti",
    category: "others",
    name: "Playful Confetti",
    gradientFrom: "#f97316", // orange-500
    gradientTo: "#22c55e", // green-500
    icon: "🎉",
    description: "Party vibes for random celebrations & hype moments.",
  },
  {
    id: "others-midnight-tech",
    category: "others",
    name: "Midnight Tech",
    gradientFrom: "#020617", // slate-950
    gradientTo: "#0ea5e9", // sky-500
    icon: "💡",
    description: "Modern neon vibe for quirky, fun messages.",
  },
  {
    id: "others-clean-slate",
    category: "others",
    name: "Clean Slate",
    gradientFrom: "#f9fafb", // gray-50
    gradientTo: "#d1d5db", // gray-300
    icon: "📄",
    description: "Minimal look when you just want the words to shine.",
  },
  {
    id: "others-purple-pop",
    category: "others",
    name: "Purple Pop",
    gradientFrom: "#a855f7", // purple-500
    gradientTo: "#ec4899", // pink-500
    icon: "🎈",
    description: "Loud, fun gradient for playful moments.",
  },
  {
    id: "others-citrus-mix",
    category: "others",
    name: "Citrus Mix",
    gradientFrom: "#f97316", // orange-500
    gradientTo: "#facc15", // yellow-400
    icon: "🍋",
    description: "Citrus colours for random hype, congrats, or 'just because'.",
  },
];

export const TEMPLATES: TemplateStyle[] = [
  ...LOVE_TEMPLATES,
  ...APOLOGY_TEMPLATES,
  ...NEW_BORN_TEMPLATES,
  ...WEDDING_TEMPLATES,
  ...CONDOLENCE_TEMPLATES,
  ...GETWELL_TEMPLATES,
  ...OTHER_TEMPLATES,
];

// Helper functions for UI

export function getTemplatesByCategory(
  category: TemplateCategory
): TemplateStyle[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): TemplateStyle | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getDefaultTemplateForCategory(
  category: TemplateCategory
): TemplateStyle {
  const list = getTemplatesByCategory(category);
  return list[0] ?? TEMPLATES[0];
}