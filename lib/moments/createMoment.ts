/* eslint-disable @typescript-eslint/no-explicit-any */
export type CreateMomentPayload = Record<string, any>;

export const createMoment = async (payload: CreateMomentPayload) => {
  const res = await fetch("/api/moments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Failed to create moment");
  }

  return json.moment;
};