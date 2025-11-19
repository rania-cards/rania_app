const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL =
  process.env.ELEVENLABS_BASE_URL ?? "https://api.elevenlabs.io";

if (!ELEVENLABS_API_KEY) {
  console.warn(
    "[RANIA] ELEVENLABS_API_KEY is not set. Kid voice generation will fail until configured."
  );
}

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface SynthesizeSpeechOptions {
  voiceId: string;
  modelId?: string;
  settings?: ElevenLabsVoiceSettings;
}

export interface SynthesizeSpeechResult {
  audio: ArrayBuffer;
  contentType: string;
}

/**
 * Call ElevenLabs Text-to-Speech to synthesize audio from text.
 * Must be called from a server environment (Node.js runtime).
 */
export async function synthesizeSpeech(
  text: string,
  options: SynthesizeSpeechOptions
): Promise<SynthesizeSpeechResult> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const url = `${ELEVENLABS_BASE_URL.replace(
    /\/$/,
    ""
  )}/v1/text-to-speech/${options.voiceId}`;

  const payload = {
    text,
    model_id: options.modelId ?? "eleven_turbo_v2",
    voice_settings: {
      stability: options.settings?.stability ?? 0.5,
      similarity_boost: options.settings?.similarityBoost ?? 0.8,
      style: options.settings?.style ?? 0,
      use_speaker_boost: options.settings?.useSpeakerBoost ?? true,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[RANIA] ElevenLabs TTS error:", res.status, body);
    throw new Error('ElevenLabs TTS failed with status ${res.status}');
  }

  const audio = await res.arrayBuffer();
  const contentType = res.headers.get("Content-Type") ?? "audio/mpeg";

  return { audio, contentType };
}