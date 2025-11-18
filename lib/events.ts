import { getSupabaseClient } from "./supabaseClient";

export type RaniaEventType =
  | "draft_created"
  | "draft_abandoned"
  | "moment_sent";

export async function logRaniaEvent(
  eventType: RaniaEventType,
  payload: Record<string, unknown>
) {
  // TODO: You can later create an "events" table in Supabase and insert here.
  // For now, we just log to server console.
  console.log("[RANIA EVENT]", eventType, payload);
}