import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// NOTE: In production you MUST verify Paystack's signature header (`x-paystack-signature`).
// For now, this is a simple stub that logs the event.

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text(); // keep as text if you later want to verify signature
    const signature = req.headers.get("x-paystack-signature") || "";

    console.log("[RANIA] Received Paystack webhook", { signature, rawBody });

    // TODO: verify signature using PAYSTACK_SECRET_KEY and update:
    // - mark moment as paid (is_premium = true, price_charged = ...)
    // - maybe log in a payments table

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[RANIA] Paystack webhook error", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}