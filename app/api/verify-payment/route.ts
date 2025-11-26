/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const json = await paystackRes.json();

    const isSuccess =
      paystackRes.ok &&
      json.status === true &&
      json.data?.status === "success";

    // Update DB
    await supabase.from("payments").upsert(
      {
        guest_id: guestId,
        reference,
        amount,
        verified: isSuccess,
        status: isSuccess ? "success" : "failed",
        raw_provider: json,
        currency: json.data?.currency ?? "KES",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "reference" }
    );

    if (!isSuccess) {
      return NextResponse.json(
        {
          verified: false,
          error: json.data?.gateway_response || json.message || "Not successful",
          raw: json,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      payment: json.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { verified: false, error: err.message },
      { status: 500 }
    );
  }
}