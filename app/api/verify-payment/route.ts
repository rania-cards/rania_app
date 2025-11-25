/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackCurrency = process.env.PAYSTACK_CURRENCY ?? "KES";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { reference, guestId, amount } = await req.json();

    if (!reference || !guestId) {
      return NextResponse.json(
        { verified: false, error: "Missing reference or guestId" },
        { status: 400 }
      );
    }

    // record initial payment attempt
    await supabase.from("payments").upsert(
      {
        guest_id: guestId,
        reference,
        amount,
        status: "init",
        verified: false,
      },
      { onConflict: "reference" }
    );

    if (!paystackSecretKey) {
      console.warn("Missing PAYSTACK_SECRET_KEY — cannot verify");
      return NextResponse.json(
        { verified: false, error: "No secret key" },
        { status: 500 }
      );
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const json = await paystackRes.json();

    const isSuccess =
      paystackRes.ok &&
      json.status === true &&
      json.data?.status === "success";

    const paymentStatus = isSuccess ? "success" : "failed";

    // update payments table with real result
    await supabase.from("payments").update({
      status: paymentStatus,
      verified: isSuccess,
      raw_provider: json,
      currency: json.data?.currency ?? paystackCurrency,
      updated_at: new Date().toISOString(),
    }).eq("reference", reference);

    if (!isSuccess) {
      return NextResponse.json(
        { verified: false, error: json.message || "Verification failed", raw: json },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true, payment: json.data });
  } catch (err: any) {
    console.error("verify-payment error:", err);
    return NextResponse.json(
      { verified: false, error: err.message },
      { status: 500 }
    );
  }
}