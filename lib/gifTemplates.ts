export type GifPackId = "hearts" | "sparkles";

export type GifPack = {
  id: GifPackId;
  name: string;
  gifUrls: [string, string, string];
};

export const GIF_PACKS: GifPack[] = [
  {
    id: "hearts",
    name: "Hearts Pack",
    gifUrls: [
      "/gif-templates/hearts-1.gif",
      "/gif-templates/hearts-2.gif",
      "/gif-templates/hearts-3.gif",
    ],
  },
  {
    id: "sparkles",
    name: "Sparkles Pack",
    gifUrls: [
      "/gif-templates/sparkles-1.gif",
      "/gif-templates/sparkles-2.gif",
      "/gif-templates/sparkles-3.gif",
    ],
  },
];

export function getGifPack(id: GifPackId): GifPack | undefined {
  return GIF_PACKS.find((p) => p.id === id);
}

