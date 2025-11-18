import { NextResponse } from "next/server";
import { getReferralStatus } from "@/lib/referrals";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  const status = await getReferralStatus(userId);

  return NextResponse.json(status);
}