/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

if (!PAYSTACK_SECRET_KEY) {
  throw new Error("Missing PAYSTACK_SECRET_KEY");
}

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference");

    if (!reference) {
      console.error("No reference in callback");
      return NextResponse.redirect(
        `${NEXT_PUBLIC_BASE_URL}/create/moment?payment=error&message=No+payment+reference`
      );
    }

    console.log("Payment callback received for reference:", reference);

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    console.log("Paystack verification response:", data.status, data.data?.status);

    if (!response.ok) {
      console.error("Paystack verification failed:", data);
      return NextResponse.redirect(
        `${NEXT_PUBLIC_BASE_URL}/create/moment?payment=failed&reference=${reference}`
      );
    }

    if (data.data.status === "success") {
      console.log("Payment verified successfully");
      // Store payment info temporarily in a cookie or redirect with success
      const response = NextResponse.redirect(
        `${NEXT_PUBLIC_BASE_URL}/create/moment?payment=success&reference=${reference}`
      );
      
      // Set a cookie to track payment
      response.cookies.set({
        name: "paymentVerified",
        value: JSON.stringify({
          reference,
          status: "success",
          amount: data.data.amount / 100,
        }),
        maxAge: 3600, // 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    } else {
      console.error("Payment status is not success:", data.data.status);
      return NextResponse.redirect(
        `${NEXT_PUBLIC_BASE_URL}/create/moment?payment=pending&reference=${reference}`
      );
    }
  } catch (err: any) {
    console.error("Payment callback error:", err);
    return NextResponse.redirect(
      `${NEXT_PUBLIC_BASE_URL}/create/moment?payment=error&message=${encodeURIComponent(err.message)}`
    );
  }
}