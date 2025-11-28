/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { getGuestId } from "@/lib/guestId";
import {
  initPaystackPayment,
  verifyPaystackPayment,
} from "@/lib/paystackClients";

import { textToImage } from "@/lib/moments/canvasText";
import { renderStillImage } from "@/lib/moments/canvasStill";
import { uploadDataUrlToSupabase } from "@/lib/moments/storage";
import { buildTenorQuery, fetchGifPreviews } from "@/lib/moments/tenor";
import { createMoment as createMomentApi } from "@/lib/moments/createMoment";
import { StillTemplateId } from "@/lib/moments/templates";

import { Step1MessageForm } from "./Step1MessageForm";
import { Step2FormatSelector } from "./Step2FormatSelector";
import { Step3StillSpotlight } from "./Step3StillSpotlight";
import { Step3GifStatusTrio } from "./Step3GifStatusTrio";
import { Step3TextFree } from "./Step3TextFree";
import { Step4SuccessShare } from "./Step4SuccessShare";
import { ProcessingOverlay } from "./ProcessingOverlay";

type Step = 1 | 2 | 3 | 4;
type DeliveryFormat = "text" | "still" | "gif";
type Gender = "none" | "male" | "female";

export const CreateMomentContent: React.FC = () => {
  const router = useRouter();

  // Load Paystack inline script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      console.log("Paystack inline script loaded");
    };
    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [guestId, setGuestId] = useState("");

  // Form inputs
  const [receiverName, setReceiverName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [tone, setTone] = useState("warm");
  const [gender, setGender] = useState<Gender>("none");
  const [userMessage, setUserMessage] = useState("");

  // AI Message
  const [finalMessage, setFinalMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Delivery format & templates
  const [selectedFormat, setSelectedFormat] =
    useState<DeliveryFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<StillTemplateId | null>(null);
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<
    string | null
  >(null);

  // UI State
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [momentId, setMomentId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  // GIF preview (Tenor)
  const [gifPreviewUrls, setGifPreviewUrls] = useState<string[]>([]);
  const [gifPreviewLoading, setGifPreviewLoading] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [generatedGifDataUrl, setGeneratedGifDataUrl] = useState<string | null>(
    null
  );
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifGenerationError, setGifGenerationError] = useState<string | null>(
    null
  );
  const [lastGeneratedGifUrl, setLastGeneratedGifUrl] = useState<string | null>(
    null
  ); // NEW: caching to avoid double generation

  // Init guestId
  useEffect(() => {
    const id = getGuestId();
    setGuestId(id);
  }, []);

  // ---------- AI Polish ----------
  const handleGenerateMessage = async () => {
    try {
      setError("");
      if (!userMessage.trim()) {
        setError("Please write something first");
        return;
      }

      setIsGenerating(true);

      const res = await fetch("/api/moments/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: receiverName || "Someone Special",
          occasion: occasion || "Just Because",
          relationship: relationship || "Friend",
          tone,
          gender,
          userMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setFinalMessage(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------- Tenor GIF helpers ----------
  const handleFetchGifPreviews = async () => {
    try {
      setGifPreviewLoading(true);
      setError("");

      const baseMessage = finalMessage || userMessage || "";
      const query = buildTenorQuery(baseMessage, receiverName);

      const urls = await fetchGifPreviews(query, 8);
      setGifPreviewUrls(urls);
      setSelectedGifUrl(urls[0] ?? null);
      if (urls[0]) {
        setPreview(urls[0]);
      }
    } catch (err: any) {
      console.error("Tenor preview error:", err);
      setError(err.message || "Could not load GIF previews");
      setGifPreviewUrls([]);
      setSelectedGifUrl(null);
    } finally {
      setGifPreviewLoading(false);
    }
  };

  const generateStatusTrioGif = async (gifUrl: string) => {
    // Prevent double generation for the same Tenor GIF
    if (gifUrl === lastGeneratedGifUrl && generatedGifDataUrl) {
      console.log("♻️ Reusing already generated GIF for this URL");
      setSelectedGifUrl(gifUrl);
      setPreview(generatedGifDataUrl);
      return;
    }

    try {
      setIsGeneratingGif(true);
      setGifGenerationError(null);
      setLastGeneratedGifUrl(gifUrl);
      console.log("🎬 Generating complete Status Trio GIF card on backend...");

      const res = await fetch("/api/gif/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenorGifUrl: gifUrl,
          receiverName: receiverName || "Someone Special",
          message: finalMessage || userMessage,
          senderName: senderName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.gifDataUrl) {
        throw new Error(data.error || "Failed to generate Status Trio GIF");
      }

      console.log("✅ Complete Status Trio card generated successfully!");
      setGeneratedGifDataUrl(data.gifDataUrl);
      setPreview(data.gifDataUrl);
      setIsGeneratingGif(false);
    } catch (err: any) {
      console.error("❌ GIF generation failed:", err);
      setIsGeneratingGif(false);
      setGifGenerationError(err.message);
      throw err;
    }
  };

  // ---------- Create moment (DB insert) ----------
  const createMoment = async (payload: any) => {
    const moment = await createMomentApi(payload);

    const effectiveMedia =
      moment.mediaUrl || payload.mediaUrl || mediaUrl || preview || null;

    setMomentId(moment.id);
    setShareUrl(`${window.location.origin}/moment/${moment.id}`);
    setMediaUrl(effectiveMedia);
    setPreview(effectiveMedia); // ensure success screen always has image

    setSuccessMessage(
      `${
        payload.deliveryType === "text"
          ? "📝 Text"
          : payload.deliveryType === "still"
          ? "🖼️ Spotlight Poster"
          : "🎬 Status Trio"
      } moment created! 🎉`
    );
    setStep(4);
  };

  // ---------- Pay + Create main flow ----------
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
        setError("⚠️ Please select a background template first");
        return;
      }

      if (selectedFormat === "gif" && !generatedGifDataUrl) {
        setError("⚠️ Please select a GIF and wait for it to finish generating");
        return;
      }

      const isPaid = selectedFormat === "still" || selectedFormat === "gif";
      const amount =
        selectedFormat === "still"
          ? 50
          : selectedFormat === "gif"
          ? 100
          : 0;

      const basePayload = {
        receiverName,
        senderName,
        occasion,
        relationship,
        tone,
        gender,
        message: finalMessage,
      };

      // 1) TEXT — FREE, NO PAYSTACK
      if (!isPaid) {
        setIsProcessing(true);
        setError("Creating your moment...");

        const textDataUrl = await textToImage(finalMessage, senderName);
        const url = await uploadDataUrlToSupabase(textDataUrl, "text");

        await createMoment({
          guestId,
          receiverName,
          senderName,
          occasion,
          relationship,
          tone,
          gender,
          messageText: finalMessage,
          deliveryType: "text",
          isPremium: false,
          priceCharged: 0,
          mediaUrl: url,
        });

        setIsProcessing(false);
        return;
      }

      // 2) PAID FLOWS: STILL + GIF
      const reference = crypto.randomUUID();
      sessionStorage.setItem("pendingDelivery", JSON.stringify(basePayload));
      sessionStorage.setItem("lastPaystackReference", reference);
      setIsProcessing(true);
      setError("Processing your order...");

      const uniqueEmail = `guest+${guestId.substring(
        0,
        8
      )}-${Date.now()}@raniaonline.com`;

      // Pre-start STILL generation (runs during payment)
      let stillMediaPromise: Promise<string> | null = null;
      if (selectedFormat === "still") {
        stillMediaPromise = (async () => {
          try {
            console.log("🖼️ Starting Spotlight Poster generation...");
            const stillDataUrl = await renderStillImage(
              selectedTemplate!,
              finalMessage || userMessage,
              senderName,
              selectedTemplate === "upload"
                ? uploadedImageDataUrl || undefined
                : undefined
            );
            const stillMediaUrl = await uploadDataUrlToSupabase(
              stillDataUrl,
              "still"
            );
            console.log("✅ Spotlight Poster generated:", stillMediaUrl);
            return stillMediaUrl;
          } catch (err: any) {
            console.error("❌ Still image generation failed:", err);
            throw err;
          }
        })();
      }

      initPaystackPayment({
        email: uniqueEmail,
        amount: amount,
        reference,
        onSuccess: async () => {
          try {
            console.log("💳 Payment successful, verifying with Paystack...");
            setError("Verifying payment...");

            let verified: any;
            try {
              verified = await verifyPaystackPayment(reference, guestId, amount);
              console.log("✅ Payment verified:", verified);
            } catch (verifyErr: any) {
              console.warn("⚠️ Verification error:", verifyErr.message);
              verified = { verified: false, pending: true };
            }

            setError("Finalizing your moment...");

            // STILL POSTER PATH
            if (selectedFormat === "still" && stillMediaPromise) {
              const stillMediaUrl = await stillMediaPromise;

              await createMoment({
                guestId,
                receiverName,
                senderName,
                occasion,
                relationship,
                tone,
                gender,
                messageText: finalMessage,
                deliveryType: "still",
                isPremium: true,
                priceCharged: amount,
                paymentReference: reference,
                template: selectedTemplate,
                mediaUrl: stillMediaUrl,
              });
            }

            // GIF STATUS TRIO PATH (no second generation, only upload)
            if (selectedFormat === "gif") {
              if (!generatedGifDataUrl) {
                console.error("❌ GIF not generated. Error:", gifGenerationError);
                throw new Error(
                  gifGenerationError || "GIF generation incomplete. Please try again."
                );
              }

              console.log("📤 Uploading pre-generated Status Trio GIF to storage...");
              const gifMediaUrl = await uploadDataUrlToSupabase(
                generatedGifDataUrl,
                "gif"
              );
              console.log("✅ GIF uploaded successfully:", gifMediaUrl);

              await createMoment({
                guestId,
                receiverName,
                senderName,
                occasion,
                relationship,
                tone,
                gender,
                messageText: finalMessage,
                deliveryType: "gif",
                isPremium: true,
                priceCharged: amount,
                paymentReference: reference,
                gifUrls: [gifMediaUrl],
                mediaUrl: gifMediaUrl,
              });
            }

            if (verified?.pending) {
              setSuccessMessage((prev) =>
                (prev || "").concat(
                  "\n⏳ Payment verification is finishing up..."
                )
              );
            }
          } catch (err: any) {
            console.error("❌ Error in onSuccess:", err);
            setError(err.message || "Failed to create moment");
          } finally {
            setIsProcessing(false);
            sessionStorage.removeItem("pendingDelivery");
            sessionStorage.removeItem("lastPaystackReference");
          }
        },
        onError: (err: any) => {
          console.error("❌ Payment error:", err);
          setError(err?.message || "Payment was cancelled or failed");
          setIsProcessing(false);
          sessionStorage.removeItem("pendingDelivery");
          sessionStorage.removeItem("lastPaystackReference");
        },
      });
    } catch (err: any) {
      console.error("💥 Payment flow error:", err);
      setError(err.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  // ---------- Spotlight helpers ----------
  const handleSelectTemplate = async (templateId: StillTemplateId) => {
    setSelectedTemplate(templateId);
    setUploadedImageDataUrl(null);

    try {
      setError("Generating preview…");
      const url = await renderStillImage(
        templateId,
        finalMessage || userMessage,
        senderName
      );
      setPreview(url);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate preview");
    }
  };

  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploadedImageDataUrl(dataUrl);
      setSelectedTemplate("upload");

      try {
        setError("Generating preview…");
        const url = await renderStillImage(
          "upload",
          finalMessage || userMessage,
          senderName,
          dataUrl
        );
        setPreview(url);
        setError("");
      } catch (err: any) {
        console.error(err);
        setError("Failed to generate preview from uploaded photo");
      }
    };
    reader.readAsDataURL(file);
  };

  // ---------- Share / Download ----------
  const shareOnWhatsApp = async () => {
    try {
      setError("");

      const message = `Check out my Rania moment!\n\n${shareUrl}`;
      const encodedMessage = encodeURIComponent(message);

      const isMobile = /mobile|android|iphone|ipad|windows phone/i.test(
        navigator.userAgent
      );

      if (isMobile) {
        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
        setSuccessMessage("Opening WhatsApp... 💬");
        setTimeout(() => setSuccessMessage(""), 2000);
        return;
      }

      window.open(
        `https://web.whatsapp.com/send?text=${encodedMessage}`,
        "_blank"
      );
      setSuccessMessage("Opening WhatsApp Web... 💬");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err: any) {
      console.error(err);
      setError(`Share failed: ${err.message}`);
    }
  };

  const downloadMoment = async () => {
    try {
      setError("");

      let downloadUrl = mediaUrl;

      if (!downloadUrl && momentId) {
        const res = await fetch(`/api/moments/${momentId}`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to fetch moment details");
        downloadUrl = data.moment?.mediaUrl || data.moment?.gifUrl || null;
      }

      if (!downloadUrl) {
        setError("No media available for download");
        return;
      }

      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to download media (status ${res.status})`);
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        setError("Downloaded file is empty");
        return;
      }

      let ext = "png";
      if (blob.type === "image/gif") {
        ext = "gif";
      } else if (blob.type === "image/jpeg") {
        ext = "jpg";
      } else if (blob.type === "application/octet-stream") {
        if (downloadUrl.includes(".gif")) ext = "gif";
        else if (
          downloadUrl.includes(".jpg") ||
          downloadUrl.includes(".jpeg")
        )
          ext = "jpg";
        else if (downloadUrl.includes(".png")) ext = "png";
      }

      if (selectedFormat === "gif" && ext !== "gif") {
        ext = "gif";
      }

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `rania-moment-${momentId || Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(`Download failed: ${err.message}`);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setSuccessMessage("Link copied! 📋");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleViewOnline = () => {
    if (!shareUrl) return;
    window.open(shareUrl, "_blank");
  };

  const resetAll = () => {
    setStep(1);
    setReceiverName("");
    setSenderName("");
    setOccasion("");
    setRelationship("");
    setTone("warm");
    setGender("none");
    setUserMessage("");
    setFinalMessage("");
    setSelectedFormat(null);
    setSelectedTemplate(null);
    setUploadedImageDataUrl(null);
    setSelectedGifUrl(null);
    setGifPreviewUrls([]);
    setGeneratedGifDataUrl(null);
    setGifGenerationError(null);
    setLastGeneratedGifUrl(null);
    setError("");
    setSuccessMessage("");
    setShareUrl("");
    setPreview(null);
    setMomentId(null);
    setMediaUrl(null);
  };

  // ===================================================================
  // JSX
  // ===================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Create Moment
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-slate-300 text-lg">
            Say what matters in a way they&apos;ll never forget
          </p>
        </div>

        {/* Error / success */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {successMessage &&
          successMessage !== "Link copied! 📋" && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
              <p className="text-green-200 text-sm whitespace-pre-line">
                {successMessage}
              </p>
            </div>
          )}

        {/* STEP 1: Write Message */}
        {step === 1 && (
          <Step1MessageForm
            receiverName={receiverName}
            setReceiverName={setReceiverName}
            senderName={senderName}
            setSenderName={setSenderName}
            occasion={occasion}
            setOccasion={setOccasion}
            relationship={relationship}
            setRelationship={setRelationship}
            tone={tone}
            setTone={setTone}
            gender={gender}
            setGender={setGender}
            userMessage={userMessage}
            setUserMessage={setUserMessage}
            isGenerating={isGenerating}
            onGenerate={handleGenerateMessage}
          />
        )}

        {/* STEP 2: Choose Format */}
        {step === 2 && !selectedFormat && (
          <Step2FormatSelector
            finalMessage={finalMessage}
            onSelectFormat={(format) => {
              setSelectedFormat(format);
              if (format === "gif") {
                // fetch previews once when entering GIF step
                handleFetchGifPreviews();
              }
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {/* STEP 3: Spotlight Poster */}
        {step === 3 && selectedFormat === "still" && (
          <Step3StillSpotlight
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            preview={preview}
            onUploadFile={handleUploadFile}
            isProcessing={isProcessing}
            onPayAndCreate={handlePayAndCreate}
            onBack={() => {
              setSelectedFormat(null);
              setSelectedTemplate(null);
              setUploadedImageDataUrl(null);
              setPreview(null);
              setStep(2);
            }}
          />
        )}

        {/* STEP 3: GIF Status Trio */}
        {step === 3 && selectedFormat === "gif" && (
          <Step3GifStatusTrio
            gifPreviewUrls={gifPreviewUrls}
            gifPreviewLoading={gifPreviewLoading}
            selectedGifUrl={selectedGifUrl}
            setSelectedGifUrl={setSelectedGifUrl}
            generatedGifDataUrl={generatedGifDataUrl}
            isGeneratingGif={isGeneratingGif}
            gifGenerationError={gifGenerationError}
            onFetchPreviews={handleFetchGifPreviews}
            onGenerateGif={generateStatusTrioGif}
            isProcessing={isProcessing}
            onPayAndCreate={handlePayAndCreate}
            onBack={() => {
              setSelectedFormat(null);
              setSelectedGifUrl(null);
              setGeneratedGifDataUrl(null);
              setGifGenerationError(null);
              setLastGeneratedGifUrl(null);
              setGifPreviewUrls([]);
              setPreview(null);
              setStep(2);
            }}
          />
        )}

        {/* STEP 3: Text Format */}
        {step === 3 && selectedFormat === "text" && (
          <Step3TextFree
            finalMessage={finalMessage}
            isProcessing={isProcessing}
            onCreate={handlePayAndCreate}
            onBack={() => {
              setSelectedFormat(null);
              setStep(2);
            }}
          />
        )}

        {/* STEP 4: Success & Share */}
        {step === 4 && (
          <Step4SuccessShare
            successMessage={successMessage}
            // ensure success page always has some preview (poster/gif)
            preview={preview || mediaUrl || null}
            shareUrl={shareUrl}
            mediaUrl={mediaUrl}
            momentId={momentId}
            onShareWhatsApp={shareOnWhatsApp}
            onDownload={downloadMoment}
            onCopyLink={copyToClipboard}
            onViewOnline={handleViewOnline}
            onCreateAnother={resetAll}
          />
        )}

        {/* GLOBAL PROCESSING OVERLAY */}
        {isProcessing && <ProcessingOverlay selectedFormat={selectedFormat} />}
      </div>
    </div>
  );
};