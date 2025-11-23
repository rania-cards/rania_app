/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Initialize Paystack payment and redirect
 */
export async function initPaystackPayment(config: {
  email: string;
  amount: number; // in Kenyan Shillings
  reference: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}) {
  try {
    // Call backend to initialize payment
    const response = await fetch("/api/initialize-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: config.email,
        amount: config.amount * 100, // Convert to cents
        reference: config.reference,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      config.onError?.(new Error(data.error || "Payment initialization failed"));
      return;
    }

    console.log("Payment initialized");
    console.log("Authorization URL:", data.authorization_url);

    // Store reference in session storage for later verification
    sessionStorage.setItem("lastPaystackReference", config.reference);
    sessionStorage.setItem("paymentInitTime", Date.now().toString());

    // Redirect to Paystack authorization URL
    if (data.authorization_url) {
      // Open in same window
      window.location.href = data.authorization_url;
    } else {
      config.onError?.(new Error("No authorization URL received"));
    }
  } catch (err: any) {
    console.error("Payment init error:", err);
    config.onError?.(err);
  }
}

/**
 * Verify payment on backend
 */
export async function verifyPaystackPayment(reference: string) {
  const response = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Payment verification failed");
  }

  return response.json();
}

/**
 * Check if user is returning from Paystack
 */
export function isReturningFromPaystack(): boolean {
  if (typeof window === "undefined") return false;
  const reference = sessionStorage.getItem("lastPaystackReference");
  const initTime = sessionStorage.getItem("paymentInitTime");
  
  if (!reference || !initTime) return false;
  
  // Check if it's been more than 10 seconds since payment init (typical payment time)
  const elapsed = Date.now() - parseInt(initTime);
  return elapsed > 3000; // At least 3 seconds have passed
}