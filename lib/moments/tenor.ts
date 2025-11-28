export const buildTenorQuery = (
  baseMessage: string,
  receiverName: string
): string => {
  const msg = (baseMessage || "").toLowerCase();

  let theme = "aesthetic message";

  if (msg.includes("birthday") || msg.includes("bday")) {
    theme = "birthday aesthetic";
  } else if (msg.includes("sorry") || msg.includes("apolog")) {
    theme = "apology aesthetic";
  } else if (msg.includes("love") || msg.includes("miss you")) {
    theme = "romantic aesthetic";
  } else if (msg.includes("congrat")) {
    theme = "congratulations celebration";
  } else if (msg.includes("friend") || msg.includes("bestie")) {
    theme = "best friend aesthetic";
  }

  const name = (receiverName || "someone").split(/\s+/)[0];

  return `${theme} for ${name}`.slice(0, 80);
};

export const fetchGifPreviews = async (query: string, limit = 8) => {
  const res = await fetch(
    `/api/tenor/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch GIFs");
  }

  const urls: string[] = data.gifUrls || [];
  if (!urls.length) {
    throw new Error("No GIFs found for this message");
  }

  return urls;
};