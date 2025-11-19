import { KidVoiceProfileId, KidVoiceProfile } from "@/types";

export const KID_VOICE_PROFILES: Record<KidVoiceProfileId, KidVoiceProfile> = {
  kid_en_us: {
    id: "kid_en_us",
    label: "American Kid",
    description: "Bright, playful American English kid voice.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_KID_EN_US",
  },
  kid_mtaani: {
    id: "kid_mtaani",
    label: "Nairobi Mtaani Kid",
    description: "Urban Nairobi/Sheng-influenced kid voice.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_KID_MTAANI",
  },
  kid_tz_swahili: {
    id: "kid_tz_swahili",
    label: "Tanzanian Swahili Kid",
    description: "Soft Tanzanian Swahili accent, friendly and warm.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_KID_TZ_SW",
  },
  kid_somali_en: {
    id: "kid_somali_en",
    label: "Somali-English Kid",
    description: "Somali-accented English, emotional and heartfelt.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_KID_SOMALI_EN",
  },
  kid_kikuyu_en: {
    id: "kid_kikuyu_en",
    label: "Kikuyu Kid",
    description: "Kikuyu-accented English / Swahili mix.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_KIKUYU_EN",
  },
  kid_luo_en: {
    id: "kid_luo_en",
    label: "Luo Kid",
    description: "Luo-accented English / Swahili tone.",
    elevenLabsVoiceIdEnvVar: "ELEVENLABS_VOICE_LUO_EN",
  },
};

/**
 * Resolve the ElevenLabs voice_id from a kid voice profile id.
 * This reads the voice id from the mapped environment variable.
 */
export function resolveElevenLabsVoiceId(profileId: KidVoiceProfileId): string {
  const profile = KID_VOICE_PROFILES[profileId];
  if (!profile) {
    throw new Error(`[RANIA] Unknown kid voice profile: ${profileId}`);
  }

  const envVarName = profile.elevenLabsVoiceIdEnvVar;
  const voiceId = process.env[envVarName];

  if (!voiceId) {
    throw new Error(
      `[RANIA] Missing env var ${envVarName} for kid voice profile "${profileId}".`
    );
  }

  return voiceId;
}