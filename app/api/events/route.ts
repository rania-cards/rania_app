import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Log events like draft_created, draft_abandoned, moment_sent
  return NextResponse.json({ ok: true });
}