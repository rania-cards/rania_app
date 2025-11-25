import { NextRequest, NextResponse } from "next/server";
import { GifPackId, getGifPack } from "@/lib/templates";
import { renderStatusGif } from "@/lib/renderGif";

export const runtime = "nodejs";

type GifCreateRequest = {
  packId: GifPackId;
  receiverName: string;
  message: string;
  paystackReference: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GifCreateRequest;
    const { packId, receiverName, message, paystackReference } = body;

    if (!packId || !receiverName || !message || !paystackReference) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const pack = getGifPack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid GIF pack." }, { status: 400 });
    }

    // 🔥 DEV MODE: log but don't block on verify
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

    if (paystackSecretKey) {
      try {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(
            paystackReference
          )}`,
          {
            headers: { Authorization: `Bearer ${paystackSecretKey}` },
          }
        );

        const json = await verifyRes.json();
        if (!verifyRes.ok || json.status !== true) {
          console.warn("Paystack verify warning (GIF):", json);
          // DO NOT return error – just warn and continue in dev
        } else {
          const data = json.data;
          if (data.currency !== paystackCurrency) {
            console.warn(
              `Paystack currency mismatch. Expected ${paystackCurrency}, got ${data.currency}`
            );
          }
        }
      } catch (err) {
        console.warn("Paystack verify threw error (GIF):", err);
        // ignore in dev
      }
    }

    // derive short text
    const introLine = `A moment for ${receiverName}`;
    const words = message.split(/\s+/);
    const shortMessage =
      words.slice(0, 10).join(" ") + (words.length > 10 ? "…" : "");

    // render 3 GIFs
    const gif1 = await renderStatusGif({
      packId,
      receiverName,
      introLine,
      shortMessage,
    });
    const gif2 = await renderStatusGif({
      packId,
      receiverName,
      introLine,
      shortMessage,
    });
    const gif3 = await renderStatusGif({
      packId,
      receiverName,
      introLine,
      shortMessage,
    });

    return NextResponse.json(
      {
        gifDataUrls: [gif1.gifDataUrl, gif2.gifDataUrl, gif3.gifDataUrl],
        receiverName,
        introLine,
        shortMessage,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GIF create error (server):", err);
    return NextResponse.json(
      { error: "Could not generate your GIF pack. Please try again." },
      { status: 500 }
    );
  }
}
