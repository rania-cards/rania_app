import { NextResponse } from "next/server";
import { getActiveDiscountForUser } from "@/lib/discounts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId" },
      { status: 400 }
    );
  }

  const activeDiscount = await getActiveDiscountForUser(userId);

  return NextResponse.json({ activeDiscount });
}