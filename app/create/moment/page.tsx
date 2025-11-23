/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getGuestId } from "@/lib/guestId";
import { renderStillImage, StillTemplateId } from "@/lib/stillRenderer";
import { initPaystackPayment, verifyPaystackPayment } from "@/lib/paystackClients";
import { v4 as uuidv4 } from "uuid";
import { Heart, Sparkles, Copy, Share2, Download, Loader, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

type Step = 1 | 2 | 3;
type DeliveryFormat = "text" | "still" | "gif";

export default function CreateMomentPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [guestId, setGuestId] = useState("");

  // Form inputs
  const [receiverName, setReceiverName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [tone, setTone] = useState("warm");
  const [userMessage, setUserMessage] = useState("");

  // AI Message
  const [finalMessage, setFinalMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Delivery format selection
  const [selectedFormat, setSelectedFormat] = useState<DeliveryFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StillTemplateId | null>(null);

  // UI State
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [stillPreview, setStillPreview] = useState<string | null>(null);

  // Initialize guest ID and check for pending payment
  useEffect(() => {
    const initializeAndCheck = async () => {
      // First, get the guest ID
      const id = getGuestId();
      setGuestId(id);
      console.log("Guest ID initialized:", id);

      // Then check for pending payment
      await checkPendingPayment(id);
    };

    const checkPendingPayment = async (id: string) => {
      try {
        const lastReference = sessionStorage.getItem("lastPaystackReference");
        const pendingData = sessionStorage.getItem("pendingDelivery");

        if (lastReference && pendingData) {
          console.log("=== Checking Pending Payment ===");
          console.log("Reference:", lastReference);

          setIsAutoCreating(true);
          setError("");

          // Check the payment status immediately
          try {
            console.log("Verifying payment...");
            const verified = await verifyPaystackPayment(lastReference);
            console.log("Verification result:", verified);

            if (verified.status === "success") {
              // Parse pending data
              const { delivery, message, format, template, receiverName: rName, occasion: occ, relationship: rel, tone: tne } = JSON.parse(pendingData);

              // Set form data
              setReceiverName(rName);
              setOccasion(occ);
              setRelationship(rel);
              setTone(tne);
              setFinalMessage(message);
              setSelectedFormat(delivery);
              if (template) setSelectedTemplate(template);

              // Generate still preview if it's a still moment
              if (delivery === "still" && template) {
                try {
                  const preview = await renderStillImage(template, message);
                  setStillPreview(preview);
                } catch (err) {
                  console.error("Preview generation error:", err);
                }
              }

              // Create the moment
              console.log("Creating moment with delivery:", delivery);
              await createMoment(delivery, true, delivery === "still" ? 50 : 100, lastReference, id);

              // Clean up session storage
              sessionStorage.removeItem("lastPaystackReference");
              sessionStorage.removeItem("pendingDelivery");
              sessionStorage.removeItem("paymentInitTime");
            } else if (verified.status === "pending") {
              setError("Payment is being processed. Please wait...");
              setIsAutoCreating(false);
              // Wait 3 seconds and try again
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
            
            // Try again in 3 seconds
            setTimeout(() => checkPendingPayment(id), 3000);
          }
        }
      } catch (err: any) {
        console.error("Error checking payment:", err);
        setIsAutoCreating(false);
      }
    };

    initializeAndCheck();
  }, []);

  // Step 1: Generate message with AI
  const handleGenerateMessage = async () => {
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

      const data = await response.json();

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

  // Step 2: Choose format
  const handleSelectFormat = (format: DeliveryFormat) => {
    setSelectedFormat(format);
  };

  // Step 3: Choose template (for still) or proceed to payment
  const handleSelectTemplate = async (template: StillTemplateId) => {
    setSelectedTemplate(template);
    
    // Generate preview
    try {
      const preview = await renderStillImage(template, finalMessage);
      setStillPreview(preview);
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  };

  // Handle payment
  const handlePayAndCreate = async () => {
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

      // Determine payment amount
      const isPaid = selectedFormat === "still" || selectedFormat === "gif";
      const amount = selectedFormat === "still" ? 50 : selectedFormat === "gif" ? 100 : 0;

      if (isPaid) {
        // Store pending delivery info in session storage
        const pendingData = {
          delivery: selectedFormat,
          message: finalMessage,
          format: selectedFormat,
          template: selectedTemplate,
          receiverName,
          occasion,
          relationship,
          tone,
        };
        sessionStorage.setItem("pendingDelivery", JSON.stringify(pendingData));

        // Generate unique reference
        const reference = `rania_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log("Initiating payment for:", selectedFormat, "Reference:", reference);

        // Initialize payment (will redirect to Paystack)
        try {
          await initPaystackPayment({
            email: "guest@rania.app",
            amount,
            reference,
            onSuccess: () => {
              console.log("Payment success callback triggered");
            },
            onError: (err) => {
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
        // Free text moment - create directly
        await createMoment(selectedFormat, false, 0, null);
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
    id?: string
  ) => {
    try {
      const finalGuestId = id || guestId;
      console.log("Creating moment...", { delivery, isPremium, priceCharged, guestId: finalGuestId });

      if (!finalGuestId) {
        throw new Error("Guest ID not available");
      }

      const momentData = {
        guestId: finalGuestId,
        receiverName: receiverName || "Someone Special",
        occasion: occasion || "A Special Moment",
        relationship: relationship || "Friend",
        tone: tone || "warm",
        messageText: finalMessage,
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create moment");
      }

      const { moment } = await response.json();
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setSuccessMessage("Link copied!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Check out my moment: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isAutoCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Processing Payment</h2>
          <p className="text-slate-300">Creating your moment...</p>
          <p className="text-xs text-slate-500">This may take a few moments</p>
          
          {/* Manual button if stuck on Paystack page */}
          <button
            onClick={() => {
              setIsAutoCreating(false);
              window.history.back();
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to RANIA
          </button>
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
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && successMessage !== "Link copied!" && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-green-400 mt-0.5" />
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {/* STEP 1: Write & Generate */}
        {step === 1 && (
          <div className="space-y-6 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Who are you writing to?
              </label>
              <input
                type="text"
                placeholder="e.g., Mom, Best Friend, Partner..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g., Birthday, Apology..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-400 outline-none transition"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="partner">Partner</option>
                  <option value="colleague">Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Tone/Vibe
              </label>
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
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                What do you want to say?
              </label>
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
                  Polish with Rania
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Choose Format */}
        {step === 2 && !selectedFormat && (
          <div className="space-y-6">
            {/* Message Preview */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8">
              <p className="text-center text-xl leading-relaxed text-slate-50">{finalMessage}</p>
            </div>

            {/* Format Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200">How would you like to share it?</h3>

              <button
                onClick={() => handleSelectFormat("text")}
                className="w-full p-6 rounded-xl border-2 border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1">📝 Text Moment</h4>
                    <p className="text-sm text-slate-300">Share as text card</p>
                  </div>
                  <span className="font-bold text-emerald-400">FREE</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectFormat("still")}
                className="w-full p-6 rounded-xl border-2 border-indigo-500/50 hover:border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-indigo-400 mb-1">🖼️ Still Moment</h4>
                    <p className="text-sm text-slate-300">Beautiful static card on premium background</p>
                  </div>
                  <span className="font-bold text-indigo-400">KES 50</span>
                </div>
              </button>

              <button
                onClick={() => handleSelectFormat("gif")}
                className="w-full p-6 rounded-xl border-2 border-purple-500/50 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 transition text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-purple-400 mb-1">🎬 GIF Pack</h4>
                    <p className="text-sm text-slate-300">3 animated variations of your moment</p>
                  </div>
                  <span className="font-bold text-purple-400">KES 100</span>
                </div>
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => {
                setStep(1);
                setUserMessage("");
                setFinalMessage("");
              }}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition"
            >
              ← Back to Edit
            </button>
          </div>
        )}

        {/* STEP 2B: Select Template (for Still) */}
        {step === 2 && selectedFormat === "still" && !selectedTemplate && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Choose a background style</h3>
            <div className="grid grid-cols-3 gap-4">
              {(["sunset", "midnight", "golden"] as StillTemplateId[]).map((template) => (
                <button
                  key={template}
                  onClick={() => handleSelectTemplate(template)}
                  className="rounded-xl overflow-hidden border-2 border-slate-700 hover:border-emerald-400 transition aspect-[9/16]"
                >
                  <img
                    src={`https://images.unsplash.com/photo-${template === "sunset" ? "1495521821757-a1efb6729352" : template === "midnight" ? "1419242902214-272b3f66ee7a" : "1506905925346-21bda4d32df4"}?w=300&h=500&fit=crop`}
                    alt={template}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedFormat(null)}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 2C: Show Template Preview & Create */}
        {step === 2 && selectedTemplate && (
          <div className="space-y-6">
            {stillPreview && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/50">
                <img src={stillPreview} alt="Preview" className="w-full h-auto" />
              </div>
            )}
            
            <button
              onClick={handlePayAndCreate}
              disabled={isProcessing}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create & Pay — KES 50"
              )}
            </button>

            <button
              onClick={() => setSelectedTemplate(null)}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Choose Different Style
            </button>
          </div>
        )}

        {/* STEP 2D: GIF Format */}
        {step === 2 && selectedFormat === "gif" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">GIF Moment Styles</h3>
            <p className="text-slate-300 text-sm">You&apos;ll receive 3 animated GIF variations of your message in these styles:</p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* GIF Style 1 */}
              <div className="rounded-xl overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-900">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
              </div>
              {/* GIF Style 2 */}
              <div className="rounded-xl overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-900">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">💫</span>
                </div>
              </div>
              {/* GIF Style 3 */}
              <div className="rounded-xl overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-900">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 aspect-[9/16] bg-slate-900">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-300">Your message: <span className="text-emerald-300 font-semibold">{finalMessage.substring(0, 50)}...</span></p>
            </div>
            
            <button
              onClick={handlePayAndCreate}
              disabled={isProcessing}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create & Pay — KES 100"
              )}
            </button>

            <button
              onClick={() => setSelectedFormat(null)}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 2E: Text Format */}
        {step === 2 && selectedFormat === "text" && (
          <div className="space-y-6">
            <button
              onClick={handlePayAndCreate}
              disabled={isProcessing}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Text Moment — FREE"
              )}
            </button>

            <button
              onClick={() => setSelectedFormat(null)}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

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

            {/* Share URL */}
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

            {/* Share Buttons */}
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

            {/* Create Another */}
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