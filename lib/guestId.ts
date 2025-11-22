"use client";

import { v4 as uuidv4 } from "uuid";

/**
 * Get or create a stable guest ID stored locally in the browser.
 * Returns a pure UUID (no "guest_" prefix) so it's valid for Supabase.
 * This allows anonymous users to create moments without logging in.
 */
export function getGuestId(): string {
  if (typeof window === "undefined") return uuidv4();

  const existing = localStorage.getItem("rania_guest_id");
  if (existing && existing.length > 0) return existing;

  // Store just the UUID, no prefix
  const newId = uuidv4();
  localStorage.setItem("rania_guest_id", newId);
  return newId;
}