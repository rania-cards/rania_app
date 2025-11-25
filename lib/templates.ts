export type GifPackId = "galaxyPack" | "neonPopPack" | "cyberGlowPack";

export type GifPack = {
  id: GifPackId;
  name: string;
  description: string;
  framePngs: [string, string, string, string]; // 4 frames per pack
  previewFrame: string; // used in UI
};

export const GIF_PACKS: GifPack[] = [
  {
    id: "galaxyPack",
    name: "Galaxy Pulse Pack",
    description: "Soft nebula glow and dreamy light pulses.",
    framePngs: [
      "/templates/gif/galaxy/frame-1.png",
      "/templates/gif/galaxy/frame-2.png",
      "/templates/gif/galaxy/frame-3.png",
      "/templates/gif/galaxy/frame-4.png",
    ],
    previewFrame: "/templates/gif/galaxy/frame-1.png",
  },
  {
    id: "neonPopPack",
    name: "Neon Pop Pack",
    description: "High-energy neon bursts and confetti.",
    framePngs: [
      "/templates/gif/neon-pop/frame-1.png",
      "/templates/gif/neon-pop/frame-2.png",
      "/templates/gif/neon-pop/frame-3.png",
      "/templates/gif/neon-pop/frame-4.png",
    ],
    previewFrame: "/templates/gif/neon-pop/frame-1.png",
  },
  {
    id: "cyberGlowPack",
    name: "Cyber Glow Pack",
    description: "Futuristic streaks and gold shimmer.",
    framePngs: [
      "/templates/gif/cyber-glow/frame-1.png",
      "/templates/gif/cyber-glow/frame-2.png",
      "/templates/gif/cyber-glow/frame-3.png",
      "/templates/gif/cyber-glow/frame-4.png",
    ],
    previewFrame: "/templates/gif/cyber-glow/frame-1.png",
  },
];

export function getGifPack(id: GifPackId | null | undefined) {
  return GIF_PACKS.find((p) => p.id === id);
}

// src/lib/renderGif.ts









