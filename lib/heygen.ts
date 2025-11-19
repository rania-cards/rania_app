const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL =
  process.env.HEYGEN_BASE_URL ?? "https://api.heygen.com";
const HEYGEN_DEFAULT_AVATAR_ID = process.env.HEYGEN_DEFAULT_AVATAR_ID;
const HEYGEN_DEFAULT_VOICE_ID = process.env.HEYGEN_DEFAULT_VOICE_ID;

if (!HEYGEN_API_KEY) {
  console.warn(
    "[RANIA] HEYGEN_API_KEY is not set. Kid video generation will fail."
  );
}

export type HeyGenVideoStatus = "pending" | "processing" | "completed" | "failed";

export interface HeyGenVideoCreateInput {
  scriptText: string;
  avatarId?: string;
  voiceId?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  backgroundColor?: string; // e.g. "#000000"
  // you can extend with more fields as needed
}

export interface HeyGenVideoCreateResponse {
  videoId: string;
}

export interface HeyGenVideoDetails {
  videoId: string;
  status: HeyGenVideoStatus;
  downloadUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

/**
 * Create a HeyGen video generation job.
 *
 * This is aligned with their v1 video.generate style API.
 * You may need to adjust `payload` fields depending on your plan.
 */
export async function createHeyGenVideo(
  input: HeyGenVideoCreateInput
): Promise<HeyGenVideoCreateResponse> {
  if (!HEYGEN_API_KEY) {
    throw new Error("HEYGEN_API_KEY is not configured.");
  }

  const url = `${HEYGEN_BASE_URL.replace(/\/$/, "")}/v1/video.generate`;

  const payload = {
    // Basic shape – adapt fields based on your HeyGen account docs.
    // Here we assume a "script" object with plain text.
    script: {
      type: "text",
      input: input.scriptText,
      // voice_id may or may not be needed; depends on your HeyGen config
      voice_id: input.voiceId ?? HEYGEN_DEFAULT_VOICE_ID,
    },
    avatar_id: input.avatarId ?? HEYGEN_DEFAULT_AVATAR_ID,
    aspect_ratio: input.aspectRatio ?? "16:9",
    background: input.backgroundColor ?? "#000000",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-api-key": HEYGEN_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json().catch(() => null)) as
    | { data?: { video_id?: string } }
    | null;

  if (!res.ok || !json?.data?.video_id) {
    console.error("[RANIA] HeyGen video.generate error", {
      status: res.status,
      body: json,
    });
    throw new Error(
      `HeyGen video.generate failed with status ${res.status}: ${res.statusText}`
    );
  }

  return {
    videoId: json.data.video_id,
  };
}

/**
 * Get status + URLs for a HeyGen video job.
 */
export async function getHeyGenVideoStatus(
  videoId: string
): Promise<HeyGenVideoDetails> {
  if (!HEYGEN_API_KEY) {
    throw new Error("HEYGEN_API_KEY is not configured.");
  }

  const url = `${HEYGEN_BASE_URL.replace(
    /\/$/,
    ""
  )}/v1/video/${encodeURIComponent(videoId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-api-key": HEYGEN_API_KEY,
    },
  });

  const json = (await res.json().catch(() => null)) as
    | {
        data?: {
          video_id?: string;
          status?: string;
          video_url?: string;
          thumbnail_url?: string;
          error?: string;
        };
      }
    | null;

  if (!res.ok || !json?.data?.video_id) {
    console.error("[RANIA] HeyGen video status error", {
      status: res.status,
      body: json,
    });
    throw new Error(
      `HeyGen video status failed with status ${res.status}: ${res.statusText}`
    );
  }

  const data = json.data;

  const status = (data.status as HeyGenVideoStatus) ?? "pending";

  return {
    videoId: data.video_id!,
    status,
    downloadUrl: data.video_url,
    thumbnailUrl: data.thumbnail_url,
    errorMessage: data.error,
  };
}