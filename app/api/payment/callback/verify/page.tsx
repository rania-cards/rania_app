/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get("reference");

        if (!reference) {
          setStatus("error");
          setMessage("No payment reference found");
          
          // Redirect to create moment after 3 seconds
          setTimeout(() => {
            router.push("/create/moment");
          }, 3000);
          return;
        }

        // Verify payment with backend
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
          setStatus("success");
          setMessage("Payment verified! Redirecting...");

          // Store payment success in session storage
          sessionStorage.setItem("paymentSuccess", JSON.stringify({
            reference,
            status: "success",
            timestamp: new Date().toISOString(),
          }));

          // Redirect to create moment with success flag
          setTimeout(() => {
            router.push("/create/moment?payment=success&reference=" + reference);
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Payment verification failed");

          // Redirect to create moment after 3 seconds
          setTimeout(() => {
            router.push("/create/moment?payment=failed");
          }, 3000);
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(err.message || "Something went wrong");

        // Redirect to create moment after 3 seconds
        setTimeout(() => {
          router.push("/create/moment?payment=error");
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Verifying Payment</h1>
            <p className="text-slate-400">Please wait while we verify your transaction...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-400">Payment Successful! 🎉</h1>
            <p className="text-slate-400">{message}</p>
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
              <p className="text-sm text-emerald-300">Creating your moment...</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-red-400">Verification Issue</h1>
            <p className="text-slate-400">{message}</p>
            <div className="mt-6 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
              <p className="text-sm text-yellow-300">Redirecting you back...</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}