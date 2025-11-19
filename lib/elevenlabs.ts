const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const ELEVENLABS_BASE_URL =
  process.env.ELEVENLABS_BASE_URL ?? "https://api.elevenlabs.io";

if (!ELEVENLABS_API_KEY) {
  // In dev this is fine; in prod you probably want to throw instead.
  console.warn(
    "[RANIA] ELEVENLABS_API_KEY is not set. Kid voice generation will fail."
  );
}

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface ElevenLabsTTSOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: ElevenLabsVoiceSettings;
}

/**
 * Result of a TTS call. For now we only return the raw audio bytes.
 * Your API route will decide whether to stream them, base64 encode, or store.
 */
export interface ElevenLabsTTSResult {
  audio: ArrayBuffer;
  contentType: string; // e.g. "audio/mpeg"
}

/**
 * Call ElevenLabs Text-to-Speech and return audio bytes.
 *
 * NOTE: This must be called from a server environment (Node.js),
 * not directly from a client component.
 */
export async function synthesizeSpeech(
  text: string,
  options: ElevenLabsTTSOptions = {}
): Promise<ElevenLabsTTSResult> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const voiceId = options.voiceId ?? ELEVENLABS_VOICE_ID;
  if (!voiceId) {
    throw new Error(
      "No ElevenLabs voice id provided. Set ELEVENLABS_VOICE_ID or pass voiceId."
    );
  }

  const url = `${ELEVENLABS_BASE_URL.replace(/\/$/, "")}/v1/text-to-speech/${voiceId}`;

  const body = {
    text,
    model_id: options.modelId ?? "eleven_turbo_v2",
    voice_settings: {
      stability: options.voiceSettings?.stability ?? 0.4,
      similarity_boost: options.voiceSettings?.similarityBoost ?? 0.8,
      style: options.voiceSettings?.style ?? 0.0,
      use_speaker_boost: options.voiceSettings?.useSpeakerBoost ?? true,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const textBody = await res.text().catch(() => "");
    console.error("[RANIA] ElevenLabs error response:", textBody);
    throw new Error(
      `ElevenLabs TTS request failed with status ${res.status}: ${res.statusText}`
    );
  }

  const audio = await res.arrayBuffer();

  return {
    audio,
    contentType: res.headers.get("Content-Type") ?? "audio/mpeg",
  };
}