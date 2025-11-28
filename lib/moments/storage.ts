/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const dataUrlToBlob = (dataUrl: string) => {
  const parts = dataUrl.split(",");
  const meta = parts[0];
  const base64 = parts[1] || "";
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = typeof window !== "undefined" ? atob(base64) : "";
  const len = binary.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
  return new Blob([buf], { type: mime });
};

export const uploadDataUrlToSupabase = async (
  dataUrl: string,
  filenamePrefix = "moment"
) => {
  const blob = dataUrlToBlob(dataUrl);
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/gif"
      ? "gif"
      : blob.type === "image/jpeg"
      ? "jpg"
      : "bin";

  const fileName = `${filenamePrefix}-${Date.now()}.${ext}`;
  const { data, error: uploadErr } = await supabase.storage
    .from("moments-media")
    .upload(fileName, blob as any, { upsert: true });

  if (uploadErr) throw uploadErr;

  return supabase.storage.from("moments-media").getPublicUrl(data.path).data
    .publicUrl;
};