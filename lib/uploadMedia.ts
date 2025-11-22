export async function uploadMomentMedia(
  file: File,
  momentId: string,
  userOrGuestId: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("momentId", momentId);
  formData.append("userId", userOrGuestId);

  const res = await fetch("/api/upload-media", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload");
  }

  return data.mediaUrl as string;
}