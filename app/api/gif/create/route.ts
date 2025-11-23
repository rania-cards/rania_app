import { NextRequest, NextResponse } from "next/server";
import { GifPackId, getGifPack } from "@/lib/gifTemplates";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

type GifCreateRequest = {
  packId: GifPackId;
  message: string;
  paystackReference: string;
};

type GifCreateResponse = {
  gifs?: { urls: [string, string, string]; message: string };
  error?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GifCreateRequest;
    const { packId, message, paystackReference } = body;

    if (!packId || !message || !paystackReference) {
      return NextResponse.json<GifCreateResponse>(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const pack = getGifPack(packId);
    if (!pack) {
      return NextResponse.json<GifCreateResponse>(
        { error: "Invalid GIF pack." },
        { status: 400 }
      );
    }

    if (!paystackSecretKey) {
      console.warn("PAYSTACK_SECRET_KEY not set – skipping verification (DEV ONLY).");
    } else {
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
        return NextResponse.json<GifCreateResponse>(
          { error: "We could not verify your payment. If you were charged, contact support." },
          { status: 400 }
        );
      }

      const data = verifyJson.data;
      if (data.status !== "success") {
        return NextResponse.json<GifCreateResponse>(
          { error: "Payment was not successful." },
          { status: 400 }
        );
      }

      // Optionally validate amount (KES 100)
      // const expectedAmount = 100 * 100;
      // if (data.amount < expectedAmount) { ... }

      if (data.currency !== paystackCurrency) {
        console.warn(
          `Paystack currency mismatch. Expected ${paystackCurrency}, got ${data.currency}`
        );
      }
    }

    return NextResponse.json<GifCreateResponse>({
      gifs: { urls: pack.gifUrls, message },
    });
  } catch (err) {
    console.error("GIF create error:", err);
    return NextResponse.json<GifCreateResponse>(
      { error: "Could not generate your GIF pack. Please try again." },
      { status: 500 }
    );
  }
}