/* eslint-disable @typescript-eslint/no-explicit-any */
type InitPaystackArgs = {
  email: string;
  amount: number;        // in KES, e.g. 50, 100
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
    console.error("PaystackPop is not available on window");
    if (onError) onError(new Error("Payment system not available"));
    return;
  }

  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "KES", // 🔥
    amount: amount * 100, // Paystack works in kobo
    ref: reference,
    callback: (response: any) => {
      // Paystack succeeded – hand over to our caller
      onSuccess(response);
    },
    onClose: () => {
      // IMPORTANT: DO NOT REDIRECT TO HOMEPAGE HERE
      if (onError) {
        onError(new Error("Payment window closed before completion"));
      }
    },
  });

  handler.openIframe();
}

// Optional – if you use this elsewhere
export async function verifyPaystackPayment(reference: string) {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },

    body: JSON.stringify({ reference }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Verification failed");
  }
  return data;
}