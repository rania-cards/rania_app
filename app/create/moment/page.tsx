/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getGuestId } from "@/lib/guestId";
import { renderStillImage, StillTemplateId } from "@/lib/stillRenderer";
import { initPaystackPayment, verifyPaystackPayment } from "@/lib/paystackClients";
import { Heart, Sparkles, Copy, Share2, Download, Loader, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

type Step = 1 | 2 | 3;
type DeliveryFormat = "text" | "still" | "gif";

interface PendingPaymentData {
  delivery: DeliveryFormat;
  message: string;
  format: DeliveryFormat;
  template: StillTemplateId | null;
  receiverName: string;
  occasion: string;
  relationship: string;
  tone: string;
}

function CreateMomentContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [guestId, setGuestId] = useState<string>("");

  // Form inputs
  const [receiverName, setReceiverName] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");
  const [relationship, setRelationship] = useState<string>("");
  const [tone, setTone] = useState<string>("warm");
  const [userMessage, setUserMessage] = useState<string>("");

  // AI Message
  const [finalMessage, setFinalMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Delivery format selection
  const [selectedFormat, setSelectedFormat] = useState<DeliveryFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StillTemplateId | null>(null);

  // UI State
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isAutoCreating, setIsAutoCreating] = useState<boolean>(false);
  const [stillPreview, setStillPreview] = useState<string | null>(null);

  // Initialize guest ID and check for pending payment
  useEffect(() => {
    const initializeAndCheck = async (): Promise<void> => {
      const id = getGuestId();
      setGuestId(id);
      console.log("Guest ID initialized:", id);
      await checkPendingPayment(id);
    };

    const checkPendingPayment = async (id: string): Promise<void> => {
      try {
        const lastReference = sessionStorage.getItem("lastPaystackReference");
        const pendingData = sessionStorage.getItem("pendingDelivery");

        if (!lastReference || !pendingData) return;

        console.log("=== Checking Pending Payment ===");
        console.log("Reference:", lastReference);

        setIsAutoCreating(true);
        setError("");

        let rName: string = "";
        let occ: string = "";
        let rel: string = "";
        let tne: string = "";
        let message: string = "";
        let delivery: DeliveryFormat = "text";
        let template: StillTemplateId | null = null;

        try {
          const parsed: PendingPaymentData = JSON.parse(pendingData);
          rName = parsed.receiverName;
          occ = parsed.occasion;
          rel = parsed.relationship;
          tne = parsed.tone;
          message = parsed.message;
          delivery = parsed.delivery;
          template = parsed.template;
        } catch (parseErr) {
          console.error("Error parsing pending data:", parseErr);
          setError("Could not restore form data");
          sessionStorage.removeItem("lastPaystackReference");
          sessionStorage.removeItem("pendingDelivery");
          setIsAutoCreating(false);
          return;
        }

        try {
          console.log("Verifying payment...");
          const verified = await verifyPaystackPayment(lastReference);
          console.log("Verification result:", verified);

          if (verified.status === "success") {
            setReceiverName(rName);
            setOccasion(occ);
            setRelationship(rel);
            setTone(tne);
            setFinalMessage(message);
            setSelectedFormat(delivery);
            if (template) setSelectedTemplate(template);

            if (delivery === "still" && template) {
              try {
                const preview = await renderStillImage(template, message);
                setStillPreview(preview);
              } catch (err) {
                console.error("Preview generation error:", err);
              }
            }

            console.log("Creating moment with delivery:", delivery);
            await createMoment(delivery, true, delivery === "still" ? 50 : 100, lastReference, id, rName, occ, rel, tne, message);

            sessionStorage.removeItem("lastPaystackReference");
            sessionStorage.removeItem("pendingDelivery");
            sessionStorage.removeItem("paymentInitTime");
          } else if (verified.status === "pending") {
            setError("Payment is being processed. Please wait...");
            setIsAutoCreating(false);
            setTimeout(() => checkPendingPayment(id), 3000);
          } else {
            setError("Payment verification returned: " + verified.status);
            sessionStorage.removeItem("lastPaystackReference");
            sessionStorage.removeItem("pendingDelivery");
            setIsAutoCreating(false);
          }
        } catch (verifyErr: any) {
          console.error("Verification error:", verifyErr);
          setError("Could not verify payment. Checking again...");
          setIsAutoCreating(false);
          setTimeout(() => checkPendingPayment(id), 3000);
        }
      } catch (err: any) {
        console.error("Error checking payment:", err);
        setIsAutoCreating(false);
      }
    };

    initializeAndCheck();
  }, []);

  const handleGenerateMessage = async (): Promise<void> => {
    try {
      setError("");
      if (!userMessage.trim()) {
        setError("Please write something first");
        return;
      }

      setIsGenerating(true);

      const response = await fetch("/api/moments/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: receiverName || "Someone Special",
          occasion: occasion || "Just Because",
          relationship: relationship || "Friend",
          tone: tone || "warm",
          userMessage: userMessage,
        }),
      });

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate message");
      }

      setFinalMessage(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectFormat = (format: DeliveryFormat): void => {
    setSelectedFormat(format);
  };

  const handleSelectTemplate = async (template: StillTemplateId): Promise<void> => {
    setSelectedTemplate(template);
    try {
      const preview = await renderStillImage(template, finalMessage);
      setStillPreview(preview);
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  };

  const handlePayAndCreate = async (): Promise<void> => {
    try {
      setError("");

      if (!finalMessage.trim()) {
        setError("Please generate a message first");
        return;
      }

      if (!selectedFormat) {
        setError("Please select a format");
        return;
      }

      if (selectedFormat === "still" && !selectedTemplate) {
        setError("Please select a template");
        return;
      }

      setIsProcessing(true);

      const isPaid = selectedFormat === "still" || selectedFormat === "gif";
      const amount = selectedFormat === "still" ? 50 : selectedFormat === "gif" ? 100 : 0;

      if (isPaid) {
        if (!receiverName.trim() || !occasion.trim() || !relationship.trim()) {
          setError("Please fill in all form fields");
          setIsProcessing(false);
          return;
        }

        const pendingData: PendingPaymentData = {
          delivery: selectedFormat,
          message: finalMessage.trim(),
          format: selectedFormat,
          template: selectedTemplate,
          receiverName: receiverName.trim(),
          occasion: occasion.trim(),
          relationship: relationship.trim(),
          tone: tone.trim(),
        };
        
        console.log("Storing pending data:", pendingData);
        sessionStorage.setItem("pendingDelivery", JSON.stringify(pendingData));

        const reference = `rania_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log("Initiating payment for:", selectedFormat, "Reference:", reference);

        try {
          await initPaystackPayment({
            email: "guest@rania.app",
            amount,
            reference,
            onSuccess: () => {
              console.log("Payment success callback triggered");
            },
            onError: (err: any) => {
              setError(err.message || "Payment initialization failed");
              setIsProcessing(false);
              sessionStorage.removeItem("pendingDelivery");
            },
          });
        } catch (err: any) {
          console.error("Payment init error:", err);
          setError(err.message || "Failed to initialize payment");
          setIsProcessing(false);
          sessionStorage.removeItem("pendingDelivery");
        }
      } else {
        await createMoment(selectedFormat, false, 0, null, guestId, receiverName, occasion, relationship, tone, finalMessage);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  const createMoment = async (
    delivery: DeliveryFormat,
    isPremium: boolean,
    priceCharged: number,
    reference: string | null,
    id?: string,
    rName?: string,
    occ?: string,
    rel?: string,
    tne?: string,
    msg?: string
  ): Promise<void> => {
    try {
      const finalGuestId = id || guestId;
      const finalReceiverName = rName || receiverName;
      const finalOccasion = occ || occasion;
      const finalRelationship = rel || relationship;
      const finalTone = tne || tone;
      const finalMsg = msg || finalMessage;

      if (!finalGuestId) {
        throw new Error("Guest ID not available");
      }

      if (!finalReceiverName || !finalOccasion || !finalRelationship || !finalMsg) {
        throw new Error("receiverName, occasion, relationship, and messageText are required.");
      }

      const momentData = {
        guestId: finalGuestId,
        receiverName: finalReceiverName,
        occasion: finalOccasion,
        relationship: finalRelationship,
        tone: finalTone,
        messageText: finalMsg,
        deliveryType: delivery,
        isPremium,
        priceCharged,
        referrerId: reference,
      };

      console.log("Sending moment data:", momentData);

      const response = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(momentData),
      });

      if (!response.ok) {
        const errorData: any = await response.json();
        throw new Error(errorData.error || "Failed to create moment");
      }

      const { moment }: any = await response.json();
      console.log("Moment created:", moment.id);

      setShareUrl(`${window.location.origin}/moment/${moment.id}`);
      setSuccessMessage(`${delivery === "text" ? "Text" : delivery === "still" ? "Still" : "GIF"} moment created! 🎉`);
      setStep(3);
    } catch (err: any) {
      console.error("Create moment error:", err);
      setError(err.message || "Failed to create moment");
    } finally {
      setIsProcessing(false);
      setIsAutoCreating(false);
    }
  };

  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(shareUrl);
    setSuccessMessage("Link copied!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const shareOnWhatsApp = (): void => {
    const text = `Check out my moment: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isAutoCreating) {
    const handleManualCheck = async (): Promise<void> => {
      const id = guestId || getGuestId();
      const lastReference = sessionStorage.getItem("lastPaystackReference");
      const pendingData = sessionStorage.getItem("pendingDelivery");

      if (lastReference && pendingData) {
        try {
          console.log("Manual payment check triggered");
          const verified = await verifyPaystackPayment(lastReference);
          console.log("Verification result:", verified);

          if (verified.status === "success") {
            const parsed: PendingPaymentData = JSON.parse(pendingData);
            await createMoment(
              parsed.delivery,
              true,
              parsed.delivery === "still" ? 50 : 100,
              lastReference,
              id,
              parsed.receiverName,
              parsed.occasion,
              parsed.relationship,
              parsed.tone,
              parsed.message
            );
            sessionStorage.removeItem("lastPaystackReference");
            sessionStorage.removeItem("pendingDelivery");
          } else {
            setError("Payment not confirmed yet. Please try again.");
          }
        } catch (err: any) {
          setError("Could not verify payment. " + err.message);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Processing Payment</h2>
          <p className="text-slate-300">Creating your moment...</p>
          <p className="text-xs text-slate-500">This may take a few moments</p>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={handleManualCheck}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm text-white transition"
            >
              Check Payment Status
            </button>
            
            <button
              onClick={() => {
                setIsAutoCreating(false);
                window.history.back();
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to RANIA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-4xl font-black">Create Your Moment</h1>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-slate-300">Say what matters in a way they&apos;ll never forget</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && successMessage !== "Link copied!" && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Who are you writing to?</label>
              <input
                type="text"
                placeholder="e.g., Mom, Best Friend, Partner..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Occasion</label>
                <input
                  type="text"
                  placeholder="e.g., Birthday, Apology..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
                >
                  <option value="">Select relationship</option>
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner</option>
                  <option value="colleague">Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">Tone/Vibe</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
              >
                <option value="warm">Warm & Genuine</option>
                <option value="funny">Funny & Light</option>
                <option value="sincere">Sincere & Deep</option>
                <option value="playful">Playful & Teasing</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">What do you want to say?</label>
              <textarea
                placeholder="Share what's on your heart..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition min-h-[120px] resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">{userMessage.length} characters</p>
            </div>

            <button
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Polish with AI
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2 & 3 - Omitted for brevity - use your original code */}
        {/* The rest of your UI code remains the same */}

        {/* STEP 3: Success & Share */}
        {step === 3 && (
          <div className="space-y-6 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-3xl font-black text-emerald-400 mb-2">Moment Created!</h2>
              <p className="text-slate-300">{successMessage}</p>
            </div>

            {stillPreview && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/50">
                <img src={stillPreview} alt="Still moment" className="w-full h-auto" />
              </div>
            )}

            <div className="bg-slate-950/50 rounded-lg p-4 flex items-center justify-between border border-slate-700">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-300 outline-none truncate"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 p-2 hover:bg-slate-800 rounded transition flex-shrink-0"
              >
                <Copy className="w-5 h-5 text-emerald-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={shareOnWhatsApp}
                className="py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share on WhatsApp
              </button>
              <button
                onClick={() => window.open(shareUrl, "_blank")}
                className="py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                View & Download
              </button>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setReceiverName("");
                setOccasion("");
                setRelationship("");
                setTone("warm");
                setUserMessage("");
                setFinalMessage("");
                setSelectedFormat(null);
                setSelectedTemplate(null);
                setError("");
                setSuccessMessage("");
                setShareUrl("");
                setStillPreview(null);
              }}
              className="w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-400 font-bold hover:bg-emerald-500/20 transition"
            >
              ✨ Create Another Moment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateMomentPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex items-center justify-center">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <CreateMomentContent />
    </Suspense>
  );
}