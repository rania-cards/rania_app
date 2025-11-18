import { NextResponse } from "next/server";
import { initializePaystackTransaction } from "@/lib/paystack";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, amount, reference } = body as {
      email: string;
      amount: number;
      reference: string;
    };

    if (!email || !amount || !reference) {
      return NextResponse.json(
        { error: "Missing email, amount or reference" },
        { status: 400 }
      );
    }

    const result = await initializePaystackTransaction({
      email,
      amount,
      reference,
    });

    if (!result.authorizationUrl) {
      return NextResponse.json(
        { error: "No authorization URL from Paystack" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: result.status,
      message: result.message,
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    });
  } catch (err: unknown) {
    console.error("[RANIA] Paystack init error", err);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
