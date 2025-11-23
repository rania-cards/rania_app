/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY");
}

export async function POST(request: Request) {
  try {
    const { email, amount, reference } = await request.json();

    if (!email || !amount || !reference) {
      return NextResponse.json(
        { error: "Missing required fields: email, amount, reference" },
        { status: 400 }
      );
    }

    // Build return URL - this is where user returns AFTER payment
    const returnUrl = `${NEXT_PUBLIC_BASE_URL}/api/payment-callback?reference=${reference}`;

    console.log("Initializing payment with return URL:", returnUrl);

    // Call Paystack API to initialize transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // in cents (KES)
        reference,
        currency: "KES",
        metadata: {
          reference,
          returnUrl,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Paystack API error:", data);
      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    console.log("Payment initialized:", data.data.reference);

    // Return authorization URL for redirect
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (err: any) {
    console.error("Error initializing payment:", err);
    return NextResponse.json(
      { error: err.message || "Payment initialization failed" },
      { status: 500 }
    );
  }
}