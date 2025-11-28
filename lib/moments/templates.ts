export type StillTemplateId =
  | "sunset"
  | "midnight"
  | "golden"
  | "ocean"
  | "forest"
  | "neon"
  | "rose"
  | "sky"
  | "lavender"
  | "coral"
  | "emerald"
  | "slate"
  | "upload"; // special: user-uploaded photo

export type TextStyle = {
  fontSize: number;
  fontWeight: "400" | "600" | "700" | "800";
  color: string;
  shadowColor: string;
  shadowBlur: number;
};

export type StillTemplate = {
  id: StillTemplateId;
  name: string;
  imageUrl: string;
  gradient?: string;
  textStyle: TextStyle;
  isUpload?: boolean;
};

export const STILL_TEMPLATES: Record<StillTemplateId, StillTemplate> = {
  sunset: {
    id: "sunset",
    name: "🌅 Warm Sunset",
    imageUrl:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1514306688772-aadfc4d4b5f3?w=1080&h=1920&fit=crop&q=85",
    gradient:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))",
    textStyle: {
      fontSize: 56,
      fontWeight: "800",
      color: "#fbbf24",
      shadowColor: "rgba(139, 92, 246, 0.8)",
      shadowBlur: 30,
    },
  },
  rose: {
    id: "rose",
    name: "🌹 Rose Pink",
    imageUrl:
      "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1080&h=1920&fit=crop&q=85",
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
    imageUrl:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#f1f5f9",
      shadowColor: "rgba(15, 23, 42, 0.9)",
      shadowBlur: 22,
    },
  },
  upload: {
    id: "upload",
    name: "📸 Your own photo",
    imageUrl: "",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(0,0,0,0.8)",
      shadowBlur: 24,
    },
    isUpload: true,
  },
};

export const getAllTemplates = () => Object.values(STILL_TEMPLATES);