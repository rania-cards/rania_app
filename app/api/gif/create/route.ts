// app/api/moments/create-gif/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGifPack, GifPackId } from "@/lib/designSystem";
import { createClient } from "@supabase/supabase-js";


const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

type GifCreateRequest = {
  packId: GifPackId;
  message: string;
  senderName?: string;
  paystackReference: string;
  momentId: string;
};

type GifCreateResponse = {
  gifUrls?: string[];
  previewUrl?: string;
  error?: string;
};

// Supabase client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Download GIF from URL and convert to buffer
async function downloadGif(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download GIF from ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GifCreateRequest;
    const { packId, message, senderName, paystackReference, momentId } = body;

    if (!packId || !message || !paystackReference || !momentId) {
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

      if (data.currency !== paystackCurrency) {
        console.warn(
          `Paystack currency mismatch. Expected ${paystackCurrency}, got ${data.currency}`
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const bucketName = "moments-audio"; // Your bucket name
    const uploadedUrls: string[] = [];

    // Download and upload each GIF
    for (let i = 0; i < pack.gifUrls.length; i++) {
      try {
        const gifBuffer = await downloadGif(pack.gifUrls[i]);
        const fileName = `gif-${momentId}-${i + 1}-${Date.now()}.gif`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(`gif/${fileName}`, gifBuffer, {
            contentType: "image/gif",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload GIF ${i + 1}:`, uploadError);
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`gif/${fileName}`);

        uploadedUrls.push(publicUrlData.publicUrl);
      } catch (err) {
        console.error(`Error processing GIF ${i + 1}:`, err);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json<GifCreateResponse>(
        { error: "Failed to upload any GIFs." },
        { status: 500 }
      );
    }

    // Get preview URL (first GIF)
    const previewUrl = uploadedUrls[0];

    // Update moment with GIF URLs
    const { error: updateError } = await supabase
      .from("moments")
      .update({
        media_url: previewUrl,
        gif_urls: uploadedUrls, // Store all 3 URLs
      })
      .eq("id", momentId);

    if (updateError) {
      console.error("Update moment error:", updateError);
      return NextResponse.json<GifCreateResponse>(
        { error: "Failed to update moment with GIF URLs." },
        { status: 500 }
      );
    }

    return NextResponse.json<GifCreateResponse>({
      gifUrls: uploadedUrls,
      previewUrl,
    });
  } catch (err) {
    console.error("GIF create error:", err);
    return NextResponse.json<GifCreateResponse>(
      { error: "Could not generate your GIF pack. Please try again." },
      { status: 500 }
    );
  }
}