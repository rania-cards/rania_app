export interface KidVoiceSanitizerResult {
  original: string;
  safeText: string;
  changed: boolean;
}

/**
 * Sanitizes text for safe use with kid voices.
 * Removes emojis & unsafe emotional wording that triggers ElevenLabs filters.
 */
export function sanitizeKidVoiceText(text: string): KidVoiceSanitizerResult {
  let safe = text;

  // 1) Remove emojis & symbols
  safe = safe.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
    ""
  );

  // Normalize whitespace
  safe = safe.replace(/\s+/g, " ").trim();

  // Lowercase copy for phrase detection
  const lower = safe.toLowerCase();

  // 2) Phrase-level adjustments
  if (lower.includes("come home safe")) {
    safe = safe.replace(/come home safe/gi, "I hope you are having a good day");
  }

  if (lower.includes("come back safe")) {
    safe = safe.replace(/come back safe/gi, "I hope you are doing well");
  }

  if (lower.includes("we miss you so much")) {
    safe = safe.replace(
      /we miss you so much/gi,
      "we are thinking about you a lot"
    );
  }

  if (lower.includes("we miss you")) {
    safe = safe.replace(/we miss you/gi, "we care about you");
  }

  if (lower.includes("don't leave us")) {
    safe = safe.replace(/don't leave us/gi, "we care about you so much");
  }

  if (lower.includes("do not leave us")) {
    safe = safe.replace(/do not leave us/gi, "we care about you so much");
  }

  if (lower.includes("we are crying")) {
    safe = safe.replace(
      /we are crying/gi,
      "we are feeling emotional"
    );
  }

  if (lower.includes("something bad happened")) {
    safe = safe.replace(
      /something bad happened/gi,
      "a lot is happening at home"
    );
  }

  // If still too short, prepend a neutral greeting
  if (safe.length < 15) {
    safe = `Hi! I wanted to say: ${safe}`;
  }

  const changed = safe !== text;

  return { original: text, safeText: safe, changed };
}