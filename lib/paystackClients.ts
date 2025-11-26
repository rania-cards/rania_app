/* eslint-disable @typescript-eslint/no-explicit-any */
type InitPaystackArgs = {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (response: any) => void;
  onError?: (error: any) => void;
};

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function initPaystackPayment({
  email,
  amount,
  reference,
  onSuccess,
  onError,
}: InitPaystackArgs) {
  if (typeof window === "undefined" || !window.PaystackPop) {
    console.error("PaystackPop not available");
    onError?.(new Error("Payment system not available"));
    return;
  }

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email,
    amount: amount * 100,
    currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY!,
    reference,
    callback: (response: any) => onSuccess(response),
    onClose: () =>
      onError?.(new Error("Payment window closed before completion")),
  });

  handler.openIframe();
}

 export async function verifyPaystackPayment(
  reference: string,
  guestId: string,
  amount: number
) {
  // ONLY 3 ATTEMPTS (faster feedback)
  const maxRetries = 3;
  const baseDelay = 1500; // Start at 1.5s instead of 2s

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, guestId, amount }),
      });

      const data = await res.json();

      // ✅ SUCCESS - return immediately
      if (res.ok && data.verified) {
        console.log(`✅ Payment verified on attempt ${attempt}`);
        return data;
      }

      // 🔄 RETRY (202 = Not yet visible)
      if (res.status === 202) {
        if (attempt < maxRetries) {
          const delay = baseDelay * attempt;
          console.log(
            `[Attempt ${attempt}/${maxRetries}] Waiting ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // ❌ HARD FAILURE - throw immediately (don't retry)
      if (res.status === 400 || res.status === 500) {
        throw new Error(data.error || "Verification failed");
      }
    } catch (err: any) {
      // Network error - only retry if we have attempts left
      if (attempt < maxRetries) {
        const delay = baseDelay * attempt;
        console.log(
          `[Attempt ${attempt}/${maxRetries}] Network error, retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt failed
      throw new Error(
        "Payment verification timeout. Your moment is still being created..."
      );
    }
  }

  // Max retries exhausted - but don't fail!
  // Return success-like response so moment gets created with pending status
  console.log("⏱️ Verification timeout - creating with pending status");
  return {
    verified: false,
    pending: true,
    message: "Payment verification pending - your moment will be created",
  };
}