import { NextRequest, NextResponse } from "next/server";
import { renderStillImage, StillTemplateId } from "@/lib/momentRenderer";
import { createClient } from "@supabase/supabase-js";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

type StillCreateRequest = {
  templateId: StillTemplateId;
  message: string;
  senderName?: string;
  paystackReference: string;
  momentId: string;
};

type StillCreateResponse = {
  mediaUrl?: string;
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StillCreateRequest;
    const { templateId, message, senderName, paystackReference, momentId } = body;

    if (!templateId || !message || !paystackReference || !momentId) {
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

      if (data.currency !== paystackCurrency) {
        console.warn(
          `Paystack currency mismatch. Expected ${paystackCurrency}, got ${data.currency}`
        );
      }
    }

    // Generate still image (data URL)
    const imageDataUrl = await renderStillImage(templateId, message, senderName);

    // Convert data URL to blob
    const base64Data = imageDataUrl.split(",")[1];
    const binaryString = Buffer.from(base64Data, "base64");

    // Upload to Supabase bucket
    const supabase = getSupabaseAdmin();
    const fileName = `still-${momentId}-${Date.now()}.png`;
    const bucketName = "moments-audio"; // Your bucket name

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`still/${fileName}`, binaryString, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json<StillCreateResponse>(
        { error: "Failed to save your still moment." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`still/${fileName}`);

    const mediaUrl = publicUrlData.publicUrl;

    // Update moment with media URL
    const { error: updateError } = await supabase
      .from("moments")
      .update({ media_url: mediaUrl })
      .eq("id", momentId);

    if (updateError) {
      console.error("Update moment error:", updateError);
      return NextResponse.json<StillCreateResponse>(
        { error: "Failed to update moment with media URL." },
        { status: 500 }
      );
    }

    return NextResponse.json<StillCreateResponse>({ mediaUrl });
  } catch (err) {
    console.error("Still create error:", err);
    return NextResponse.json<StillCreateResponse>(
      { error: "Could not generate your still moment. Please try again." },
      { status: 500 }
    );
  }
}