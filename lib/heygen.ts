const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_BASE_URL =
  process.env.HEYGEN_BASE_URL ?? "https://api.heygen.com";
const HEYGEN_DEFAULT_PHOTO_AVATAR_ID =
  process.env.HEYGEN_DEFAULT_PHOTO_AVATAR_ID;

if (!HEYGEN_API_KEY) {
  console.warn(
    "[RANIA] HEYGEN_API_KEY is not set. Kid video generation will fail until configured."
  );
}

export type HeyGenVideoStatus = "pending" | "processing" | "completed" | "failed";

export interface HeyGenCreateInput {
  /**
   * Text that the avatar should speak.
   */
  scriptText: string;
  /**
   * HeyGen photo avatar id (talking_photo avatar).
   */
  photoAvatarId?: string;
  /**
   * Optional: 9:16 (vertical), 16:9 (horizontal), or 1:1.
   */
  aspectRatio?: "9:16" | "16:9" | "1:1";
}

export interface HeyGenCreateResult {
  videoId: string;
}

export interface HeyGenStatusResult {
  videoId: string;
  status: HeyGenVideoStatus;
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

/**
 * Create a HeyGen talking photo video.
 */
export async function createHeyGenVideoFromPhoto(
  input: HeyGenCreateInput
): Promise<HeyGenCreateResult> {
  if (!HEYGEN_API_KEY) {
    throw new Error("HEYGEN_API_KEY is not configured.");
  }

  const avatarId = input.photoAvatarId ?? HEYGEN_DEFAULT_PHOTO_AVATAR_ID;
  if (!avatarId) {
    throw new Error(
      "No HeyGen photo avatar id provided. Set HEYGEN_DEFAULT_PHOTO_AVATAR_ID or pass photoAvatarId."
    );
  }

  const url = `${HEYGEN_BASE_URL.replace(/\/$/, "")}/v1/video.generate`;

  const payload = {
    character: {
      type: "talking_photo",
      avatar_id: avatarId,
    },
    script: {
      type: "text",
      input: input.scriptText,
    },
    aspect_ratio: input.aspectRatio ?? "9:16",
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
    console.error("[RANIA] HeyGen video.generate error:", res.status, json);
    throw new Error(`HeyGen video.generate failed with status ${res.status}`);
  }

  return {
    videoId: json.data.video_id,
  };
}

/**
 * Get status and URLs for a HeyGen video job.
 */
export async function getHeyGenVideoStatus(
  videoId: string
): Promise<HeyGenStatusResult> {
  if (!HEYGEN_API_KEY) {
    throw new Error("HEYGEN_API_KEY is not configured.");
  }

  const url = `${HEYGEN_BASE_URL.replace(
    /\/$/,
    ""
  )}/v1/video.status?video_id=${encodeURIComponent(videoId)}`;

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
    console.error("[RANIA] HeyGen video.status error:", res.status, json);
    throw new Error(`HeyGen video.status failed with status ${res.status}`);
  }

  const data = json.data!;
  const status = (data.status as HeyGenVideoStatus) ?? "pending";

  return {
    videoId: data.video_id!,
    status,
    videoUrl: data.video_url,
    thumbnailUrl: data.thumbnail_url,
    errorMessage: data.error,
  };
}