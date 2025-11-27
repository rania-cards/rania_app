/* eslint-disable @typescript-eslint/no-explicit-any */

const TENOR_API_KEY = process.env.TENOR_API_KEY;

if (!TENOR_API_KEY) {
  console.warn(
    "[TENOR] TENOR_API_KEY is not set. GIF search will fail until you add it to env."
  );
}

export async function searchTenorGifs(
  query: string,
  limit: number = 6
): Promise<string[]> {
  if (!TENOR_API_KEY) return [];

  const url = new URL("https://tenor.googleapis.com/v2/search");
  url.searchParams.set("q", query);
  url.searchParams.set("key", TENOR_API_KEY);
  url.searchParams.set("client_key", "rania");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("media_filter", "gif");

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[TENOR] Search failed", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as any;

  const results = Array.isArray(data.results) ? data.results : [];
  const gifUrls: string[] = [];

  for (const r of results) {
    const url =
      r?.media_formats?.gif?.url ||
      r?.media_formats?.tinygif?.url ||
      r?.media_formats?.mediumgif?.url;

    if (url) gifUrls.push(url);
  }

  return gifUrls;
}