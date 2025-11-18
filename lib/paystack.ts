const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;
const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || "KES";

if (!PAYSTACK_SECRET_KEY) {
  console.warn(
    "[RANIA] PAYSTACK_SECRET_KEY is not set. Payment initialization will fail."
  );
}

type InitParams = {
  email: string;
  amount: number; // in KES
  reference: string;
};

export async function initializePaystackTransaction({
  email,
  amount,
  reference,
}: InitParams) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing");
  }

  // Paystack expects amount in kobo (for NGN). For KES we still multiply by 100.
  const amountInMinorUnit = Math.round(amount * 100);

  const body = {
    email,
    amount: amountInMinorUnit,
    reference,
    currency: PAYSTACK_CURRENCY,
    callback_url: PAYSTACK_CALLBACK_URL,
  };

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[RANIA] Paystack init error", data);
    throw new Error("Failed to initialize Paystack transaction");
  }

  return {
    status: data.status as boolean,
    message: data.message as string,
    authorizationUrl: data.data?.authorization_url as string | undefined,
    reference: data.data?.reference as string | undefined,
  };
}