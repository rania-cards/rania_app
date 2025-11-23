import { NextRequest, NextResponse } from "next/server";
import { renderStillImage, StillTemplateId } from "@/lib/stillRenderer";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

type StillCreateRequest = {
  templateId: StillTemplateId;
  message: string;
  paystackReference: string;
};

type StillCreateResponse = {
  imageDataUrl?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StillCreateRequest;
    const { templateId, message, paystackReference } = body;

    if (!templateId || !message || !paystackReference) {
      return NextResponse.json<StillCreateResponse>(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!paystackSecretKey) {
      console.warn("PAYSTACK_SECRET_KEY not set – skipping verification (DEV ONLY).");
    } else {
      // Verify Paystack transaction
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          paystackReference
        )}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const verifyJson = await verifyRes.json();

      if (!verifyRes.ok || verifyJson.status !== true) {
        console.error("Paystack verify error:", verifyJson);
        return NextResponse.json<StillCreateResponse>(
          { error: "We could not verify your payment. If you were charged, contact support." },
          { status: 400 }
        );
      }

      const data = verifyJson.data;
      if (data.status !== "success") {
        return NextResponse.json<StillCreateResponse>(
          { error: "Payment was not successful." },
          { status: 400 }
        );
      }

      // Optionally validate amount/currency == KES 50
      // const expectedAmount = 50 * 100; // if smallest unit
      // if (data.amount < expectedAmount) { ... }
      if (data.currency !== paystackCurrency) {
        console.warn(
          `Paystack currency mismatch. Expected ${paystackCurrency}, got ${data.currency}`
        );
      }
    }

    const imageDataUrl = await renderStillImage(templateId, message);

    return NextResponse.json<StillCreateResponse>({ imageDataUrl });
  } catch (err) {
    console.error("Still create error:", err);
    return NextResponse.json<StillCreateResponse>(
      { error: "Could not generate your moment. Please try again." },
      { status: 500 }
    );
  }
}