/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

import { getGuestId } from "@/lib/guestId";
import {
  initPaystackPayment,
  verifyPaystackPayment,
} from "@/lib/paystackClients";

import {
  Heart,
  Sparkles,
  Copy,
  Share2,
  Download,
  Loader,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { JSX } from "react/jsx-runtime";

type Step = 1 | 2 | 3 | 4;
type DeliveryFormat = "text" | "still" | "gif";

// ---------- STILL TEMPLATES (client-side preview) ----------

export type StillTemplateId =
  | "sunset"
  | "midnight"
  | "golden"
  | "ocean"
  | "forest"
  | "neon"
  | "rose"
  | "sky"
  | "lavender"
  | "coral"
  | "emerald"
  | "slate";

type TextStyle = {
  fontSize: number;
  fontWeight: "400" | "600" | "700" | "800";
  color: string;
  shadowColor: string;
  shadowBlur: number;
};

type StillTemplate = {
  id: StillTemplateId;
  name: string;
  imageUrl: string;
  gradient?: string;
  textStyle: TextStyle;
};

const STILL_TEMPLATES: Record<StillTemplateId, StillTemplate> = {
  sunset: {
    id: "sunset",
    name: "🌅 Warm Sunset",
    imageUrl:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(139, 69, 19, 0.6)",
      shadowBlur: 20,
    },
  },
  midnight: {
    id: "midnight",
    name: "🌙 Deep Midnight",
    imageUrl:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#e0f2ff",
      shadowColor: "rgba(0, 20, 60, 0.8)",
      shadowBlur: 25,
    },
  },
  golden: {
    id: "golden",
    name: "✨ Golden Hour",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#fef3c7",
      shadowColor: "rgba(78, 22, 9, 0.7)",
      shadowBlur: 20,
    },
  },
  ocean: {
    id: "ocean",
    name: "🌊 Ocean Blue",
    imageUrl:
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(0, 30, 60, 0.7)",
      shadowBlur: 25,
    },
  },
  forest: {
    id: "forest",
    name: "🌲 Forest Green",
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ecfdf5",
      shadowColor: "rgba(5, 46, 22, 0.8)",
      shadowBlur: 25,
    },
  },
  neon: {
    id: "neon",
    name: "💜 Neon Nights",
    imageUrl:
      "https://images.unsplash.com/photo-1514306688772-aadfc4d4b5f3?w=1080&h=1920&fit=crop&q=85",
    gradient:
      "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))",
    textStyle: {
      fontSize: 56,
      fontWeight: "800",
      color: "#fbbf24",
      shadowColor: "rgba(139, 92, 246, 0.8)",
      shadowBlur: 30,
    },
  },
  rose: {
    id: "rose",
    name: "🌹 Rose Pink",
    imageUrl:
      "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#fce7f3",
      shadowColor: "rgba(190, 24, 93, 0.7)",
      shadowBlur: 22,
    },
  },
  sky: {
    id: "sky",
    name: "☁️ Clear Sky",
    imageUrl:
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(30, 58, 138, 0.6)",
      shadowBlur: 20,
    },
  },
  lavender: {
    id: "lavender",
    name: "💜 Lavender Dream",
    imageUrl:
      "https://images.unsplash.com/photo-1518066000714-58c45f1b773c?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#f5f3ff",
      shadowColor: "rgba(88, 28, 135, 0.7)",
      shadowBlur: 23,
    },
  },
  coral: {
    id: "coral",
    name: "🪸 Coral Reef",
    imageUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ffffff",
      shadowColor: "rgba(127, 29, 29, 0.7)",
      shadowBlur: 24,
    },
  },
  emerald: {
    id: "emerald",
    name: "💚 Emerald Glow",
    imageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#ecfdf5",
      shadowColor: "rgba(4, 120, 87, 0.8)",
      shadowBlur: 25,
    },
  },
  slate: {
    id: "slate",
    name: "🎭 Dark Slate",
    imageUrl:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1080&h=1920&fit=crop&q=85",
    textStyle: {
      fontSize: 56,
      fontWeight: "700",
      color: "#f1f5f9",
      shadowColor: "rgba(15, 23, 42, 0.9)",
      shadowBlur: 22,
    },
  },
};

const getAllTemplates = () => Object.values(STILL_TEMPLATES);

// ---------- SUPABASE CLIENT ----------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ======================================================================
// MAIN COMPONENT
// ======================================================================

function CreateMomentContent() {
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
  const [gender, setGender] = useState<"none" | "male" | "female">("none");
  const [userMessage, setUserMessage] = useState("");

  // AI Message
  const [finalMessage, setFinalMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Delivery format & templates
  const [selectedFormat, setSelectedFormat] =
    useState<DeliveryFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<StillTemplateId | null>(null);

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

  // Init guestId
  useEffect(() => {
    const id = getGuestId();
    setGuestId(id);
  }, []);

  // ---------- Helpers: DataURL / Upload ----------

  const dataUrlToBlob = (dataUrl: string) => {
    const parts = dataUrl.split(",");
    const meta = parts[0];
    const base64 = parts[1] || "";
    const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return new Blob([buf], { type: mime });
  };

  const uploadDataUrlToSupabase = async (
    dataUrl: string,
    filenamePrefix = "moment"
  ) => {
    const blob = dataUrlToBlob(dataUrl);
    const ext =
      blob.type === "image/png"
        ? "png"
        : blob.type === "image/gif"
        ? "gif"
        : blob.type === "image/jpeg"
        ? "jpg"
        : "bin";

    const fileName = `${filenamePrefix}-${uuidv4()}.${ext}`;
    const { data, error: uploadErr } = await supabase.storage
      .from("moments-media")
      .upload(fileName, blob as any, { upsert: true });

    if (uploadErr) throw uploadErr;

    return supabase.storage.from("moments-media").getPublicUrl(data.path).data
      .publicUrl;
  };

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

  // ---------- Still preview renderer ----------

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
       const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const renderStillImage = async (
    templateId: StillTemplateId,
    message: string,
    sender?: string
  ): Promise<string> => {
    const template = STILL_TEMPLATES[templateId];
    if (!template) throw new Error("Invalid template");

    const width = 1080;
    const height = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");

    const img = new Image();
    img.crossOrigin = "anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);

        if (template.gradient) {
          ctx.fillStyle = template.gradient;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(0, 0, width, height);
        }

        const style = template.textStyle;
        ctx.fillStyle = style.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = style.shadowColor;
        ctx.shadowBlur = style.shadowBlur;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.font = `${style.fontWeight} ${style.fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

        const lines = wrapText(ctx, message, width * 0.85);
        const lineHeight = style.fontSize * 1.5;
        const totalHeight = lines.length * lineHeight;
        let y = height / 2 - totalHeight / 2;

        for (const line of lines) {
          ctx.fillText(line, width / 2, y);
          y += lineHeight;
        }

        if (sender) {
          ctx.font = `400 ${style.fontSize * 0.5}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.globalAlpha = 0.9;
          ctx.fillText(`— ${sender}`, width / 2, height - 120);
          ctx.globalAlpha = 1;
        }

        resolve(canvas.toDataURL("image/png", 0.95));
      };

      img.onerror = () => reject(new Error("Failed to load template image"));
      img.src = template.imageUrl;
    });
  };

  const handleSelectTemplate = async (templateId: StillTemplateId) => {
    setSelectedTemplate(templateId);
    try {
      setError("Generating preview…");
      const url = await renderStillImage(templateId, finalMessage, senderName);
      setPreview(url);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to generate preview");
    }
  };

  // ---------- Tenor GIF helper functions ----------

  function buildTenorQuery(): string {
    const baseMessage = (finalMessage || userMessage || "").toLowerCase();

    let theme = "aesthetic message";

    if (baseMessage.includes("birthday") || baseMessage.includes("bday")) {
      theme = "birthday aesthetic";
    } else if (
      baseMessage.includes("sorry") ||
      baseMessage.includes("apolog")
    ) {
      theme = "apology aesthetic";
    } else if (
      baseMessage.includes("love") ||
      baseMessage.includes("miss you")
    ) {
      theme = "romantic aesthetic";
    } else if (baseMessage.includes("congrat")) {
      theme = "congratulations celebration";
    } else if (
      baseMessage.includes("friend") ||
      baseMessage.includes("bestie")
    ) {
      theme = "best friend aesthetic";
    }

    const name = (receiverName || "someone").split(/\s+/)[0];
    return `${theme} for ${name}`.slice(0, 80);
  }

  async function fetchGifPreviews() {
    try {
      setGifPreviewLoading(true);
      setError("");

      const q = buildTenorQuery();
      const res = await fetch(
        `/api/tenor/search?q=${encodeURIComponent(q)}&limit=8`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch GIFs");
      }

      const urls: string[] = data.gifUrls || [];
      if (!urls.length) {
        throw new Error("No GIFs found for this message");
      }

      setGifPreviewUrls(urls);
      setSelectedGifUrl(urls[0]);
      setPreview(urls[0]);
    } catch (err: any) {
      console.error("Tenor preview error:", err);
      setError(err.message || "Could not load GIF previews");
      setGifPreviewUrls([]);
      setSelectedGifUrl(null);
    } finally {
      setGifPreviewLoading(false);
    }
  }

  // When entering step 3 with GIF format, fetch Tenor previews once
  useEffect(() => {
    if (
      step === 3 &&
      selectedFormat === "gif" &&
      gifPreviewUrls.length === 0 &&
      !gifPreviewLoading
    ) {
      fetchGifPreviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedFormat]);

  // ---------- Text → PNG (free) ----------

  const textToImage = async (text: string, signature?: string) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const width = 1080;
    const height = 1350;

    canvas.width = width;
    canvas.height = height;

    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#111827");
    g.addColorStop(1, "#020617");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    const baseFont = 48;
    const maxWidth = width - 160;
    let fontSize = baseFont;

    const measureLines = (size: number) => {
      ctx.font = `700 ${size}px Inter, system-ui, Arial`;
      const words = text.split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    };

    let lines = measureLines(fontSize);
    while (lines.length * (fontSize * 1.25) > height * 0.6 && fontSize > 22) {
      fontSize -= 2;
      lines = measureLines(fontSize);
    }

    ctx.font = `700 ${fontSize}px Inter, system-ui, Arial`;
    const lineHeight = fontSize * 1.25;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    let y = startY;
    for (const line of lines) {
      ctx.fillText(line.trim(), width / 2, y);
      y += lineHeight;
    }

    if (signature) {
      ctx.shadowColor = "transparent";
      ctx.font = `500 20px Inter, system-ui, Arial`;
      ctx.fillStyle = "#d1d5db";
      ctx.fillText(`— ${signature}`, width / 2, height - 80);
    }

    return canvas.toDataURL("image/png");
  };

  // ---------- Create moment (DB insert only) ----------

  const createMoment = async (
    delivery: DeliveryFormat,
    isPremium: boolean,
    priceCharged: number,
    reference: string | null,
    id: string,
    data: any
  ) => {
    try {
      setError("");
      setIsProcessing(true);

      const payload: any = {
        guestId: id,
        receiverName: data.receiverName || receiverName,
        senderName: data.senderName || senderName,
        occasion: data.occasion || occasion,
        relationship: data.relationship || relationship,
        tone: data.tone || tone,
        gender: data.gender || gender,
        messageText: data.message || finalMessage,
        deliveryType: delivery,
        isPremium,
        priceCharged,
      };

      if (delivery === "still") {
        const templateToUse = data.template || selectedTemplate;
        if (!templateToUse) {
          throw new Error("Missing template for Spotlight Poster");
        }
        if (!data.mediaUrl) {
          throw new Error("Missing mediaUrl for still moment");
        }

        payload.template = templateToUse;
        payload.mediaUrl = data.mediaUrl;
      }

      if (delivery === "gif") {
        const gifUrls: string[] | undefined = data.gifUrls;
        if (!gifUrls || gifUrls.length === 0) {
          throw new Error("Missing GIF URLs for gif moment");
        }

        payload.gifUrls = gifUrls;
        payload.mediaUrl = gifUrls[0]; // primary GIF
      }

      if (delivery === "text") {
        if (!data.mediaUrl) throw new Error("Missing mediaUrl for text moment");
        payload.mediaUrl = data.mediaUrl;
      }

      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create moment");

      const { moment } = json;
      setMomentId(moment.id);
      setShareUrl(`${window.location.origin}/moment/${moment.id}`);
      setMediaUrl(moment.mediaUrl || payload.mediaUrl || null);
      setPreview(moment.mediaUrl || payload.mediaUrl || preview);

      setSuccessMessage(
        `${
          delivery === "text"
            ? "📝 Text"
            : delivery === "still"
            ? "🖼️ Spotlight Poster"
            : "🎬 Status Trio"
        } moment created! 🎉`
      );
      setStep(4);
    } catch (err: any) {
      console.error("Create moment error:", err);
      setError(err.message || "Failed to create moment");
    } finally {
      setIsProcessing(false);
    }
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

      if (selectedFormat === "gif" && !selectedGifUrl) {
        setError("⚠️ Please select a GIF first");
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
        delivery: selectedFormat,
        message: finalMessage,
        template: selectedTemplate,
        receiverName,
        senderName,
        occasion,
        relationship,
        tone,
        gender,
      };

      // 1) TEXT — FREE, NO PAYSTACK
      if (!isPaid) {
        setIsProcessing(true);
        setError("Creating your moment...");

        const textDataUrl = await textToImage(finalMessage, senderName);
        const url = await uploadDataUrlToSupabase(textDataUrl, "text");

        await createMoment("text", false, 0, null, guestId, {
          ...basePayload,
          mediaUrl: url,
        });

        setIsProcessing(false);
        return;
      }

      // 2) PAID FLOWS: STILL + GIF
      const reference = uuidv4();
      sessionStorage.setItem("pendingDelivery", JSON.stringify(basePayload));
      sessionStorage.setItem("lastPaystackReference", reference);
      setIsProcessing(true);
      setError("Processing your order...");

      const uniqueEmail = `guest+${guestId.substring(
        0,
        8
      )}-${Date.now()}@raniaonline.com`;

      initPaystackPayment({
        email: uniqueEmail,
        amount: amount,
        reference,

        onSuccess: async () => {
          try {
            console.log("💳 Payment successful, verifying with Paystack...");
            setError("Verifying payment...");

            let verified;
            try {
              verified = await verifyPaystackPayment(reference, guestId, amount);
              console.log("✅ Payment verified:", verified);
            } catch (verifyErr: any) {
              console.warn("⚠️ Verification error:", verifyErr.message);
              verified = { verified: false, pending: true };
            }

            setError("");

            // CREATE MOMENT
            console.log("📝 Creating moment...");

          if (selectedFormat === "gif") {
  console.log("GIF path: unified card via Tenor + canvas");

  // occasion / message from your state
  const res = await fetch("/api/gif/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      occasion,
      receiverName: receiverName || "Someone Special",
      message: finalMessage || userMessage,
      senderName,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.gifDataUrl) {
    console.error("GIF create API error:", data);
    throw new Error(data.error || "Failed to create Status Trio GIF");
  }

  const gifDataUrl: string = data.gifDataUrl;

  // upload unified GIF to Supabase
  const gifMediaUrl = await uploadDataUrlToSupabase(gifDataUrl, "gif");

  await createMoment("gif", true, amount, reference, guestId, {
    ...basePayload,
    mediaUrl: gifMediaUrl,
    gifUrls: [gifMediaUrl], // if you store array
  });
}

            setSuccessMessage(
              `${
                selectedFormat === "still"
                  ? "🖼️ Spotlight Poster"
                  : "🎬 Status Trio"
              } moment created! 🎉 ${
                verified?.pending
                  ? "\n⏳ Payment verification is finishing up..."
                  : ""
              }`
            );
            setStep(4);
          } catch (err: any) {
            console.error("❌ Error in onSuccess:", err);
            setError(err.message || "Failed to create moment");
          } finally {
            setIsProcessing(false);
            sessionStorage.removeItem("pendingDelivery");
            sessionStorage.removeItem("lastPaystackReference");
          }
        },

        onError: (err) => {
          console.error("❌ Payment error:", err);
          setError(err?.message || "Payment was cancelled or failed");
          setIsProcessing(false);
          sessionStorage.removeItem("pendingDelivery");
          sessionStorage.removeItem("lastPaystackReference");
        },
      });
    } catch (err: any) {
      console.error("❌ Payment flow error:", err);
      setError(err.message || "Something went wrong");
      setIsProcessing(false);
    }
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

      setSuccessMessage("Downloaded! 📥");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(`Download failed: ${err.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setSuccessMessage("Link copied! 📋");
    setTimeout(() => setSuccessMessage(""), 2000);
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

        {successMessage && successMessage !== "Link copied! 📋" && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400 mt-0.5" />
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {/* STEP 1: Write Message */}
        {step === 1 && (
          <div className="space-y-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  🎯 Who are you writing to?
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mom, Sarah, Best Friend..."
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  🔤 Your name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., John..."
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  📅 Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g., Birthday, Anniversary..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  💝 Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                >
                  <option value="">Select...</option>
                  <option value="family">👨‍👩‍👧 Family</option>
                  <option value="friend">🤝 Friend</option>
                  <option value="partner">💕 Partner</option>
                  <option value="colleague">💼 Colleague</option>
                  <option value="mentor">🎓 Mentor</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  ⚧ Gender (affects wording)
                </label>
                <select
                  value={gender}
                  onChange={(e) =>
                    setGender(e.target.value as "none" | "male" | "female")
                  }
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                >
                  <option value="none">Prefer not to specify</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                🎭 Tone/Vibe
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
              >
                <option value="warm">🔥 Warm & Genuine</option>
                <option value="funny">😂 Funny & Light</option>
                <option value="sincere">💭 Sincere & Deep</option>
                <option value="playful">🎪 Playful & Teasing</option>
                <option value="professional">💼 Professional</option>
                <option value="romantic">💕 Romantic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                💬 What do you want to say?
              </label>
              <textarea
                placeholder="Share what's on your heart... Be authentic!"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition min-h-[150px] resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">
                  {userMessage.length}/500 characters
                </p>
                {userMessage.length > 450 && (
                  <p className="text-xs text-amber-400">
                    Keep it concise for best results!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateMessage}
              disabled={isGenerating || !userMessage.trim()}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Polishing with Rania...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Polish with Rania✨
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Choose Format */}
        {step === 2 && !selectedFormat && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8">
              <p className="text-center text-2xl leading-relaxed text-slate-50 font-semibold">
                &quot;{finalMessage}&quot;
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200">
                How would you like to share it?
              </h3>

              <button
                onClick={() => {
                  setSelectedFormat("text");
                  setStep(3);
                }}
                className="w-full p-6 rounded-xl border-2 border-emerald-500/50 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1 text-lg">
                      📝 Text Moment
                    </h4>
                    <p className="text-sm text-slate-300">
                      Clean text card, perfect for sharing
                    </p>
                  </div>
                  <span className="font-bold text-emerald-400 text-lg group-hover:scale-110 transition">
                    FREE
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedFormat("still");
                  setStep(3);
                }}
                className="w-full p-6 rounded-xl border-2 border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-indigo-400 mb-1 text-lg">
                      🖼️ Spotlight Poster
                    </h4>
                    <p className="text-sm text-slate-300">
                      Premium poster-style image with your message
                    </p>
                  </div>
                  <span className="font-bold text-indigo-400 text-lg group-hover:scale-110 transition">
                    KES 50
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedFormat("gif");
                  setStep(3);
                }}
                className="w-full p-6 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-purple-400 mb-1 text-lg">
                      🎬 Status Trio
                    </h4>
                    <p className="text-sm text-slate-300">
                      Animated status-style visual using trending GIFs (Tenor)
                    </p>
                  </div>
                  <span className="font-bold text-purple-400 text-lg group-hover:scale-110 transition">
                    KES 100
                  </span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 transition"
            >
              ← Back to Edit
            </button>
          </div>
        )}

        {/* STEP 3: Spotlight Poster Selection */}
        {step === 3 && selectedFormat === "still" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">
              🎨 Choose Your Spotlight Poster Background
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {getAllTemplates().map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`rounded-xl overflow-hidden border-2 transition aspect-[9/16] group relative ${
                    selectedTemplate === template.id
                      ? "border-emerald-400 scale-105"
                      : "border-slate-600 hover:border-emerald-400"
                  }`}
                >
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <p className="text-white font-semibold text-sm">
                      {template.name}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-400/10 border-2 border-emerald-400">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedTemplate && preview && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-300">Preview:</h4>
                <div className="rounded-xl overflow-hidden border border-emerald-500/50 max-w-sm mx-auto">
                  <img src={preview} alt="Preview" className="w-full h-auto" />
                </div>

                <button
                  onClick={handlePayAndCreate}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Create & Pay — KES 50
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedFormat(null);
                setSelectedTemplate(null);
                setPreview(null);
                setStep(2);
              }}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 3: Status Trio (GIF) using Tenor */}
       {step === 3 && selectedFormat === "gif" && (
  <div className="space-y-6">
    <h3 className="text-lg font-bold text-slate-200">
      🌈 Choose Your Status Trio
    </h3>
    <p className="text-sm text-slate-300">
      Select a GIF that matches your vibe. We&apos;ll combine it with your message.
    </p>

    {gifPreviewLoading && (
      <div className="flex items-center gap-2 text-slate-300 text-sm">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Finding the best GIFs for your message…</span>
      </div>
    )}

    {/* GIF Grid Selection */}
    {!gifPreviewLoading && gifPreviewUrls.length > 0 && !selectedGifUrl && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {gifPreviewUrls.map((gifUrl, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedGifUrl(gifUrl);
              setPreview(gifUrl);
            }}
            className="relative rounded-2xl overflow-hidden border-2 border-slate-600 hover:border-purple-400 transition group aspect-square"
          >
            <img
              src={gifUrl}
              alt={`GIF option ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-center pb-3">
              <p className="text-white text-sm font-bold">Select</p>
            </div>
          </button>
        ))}
      </div>
    )}

    {/* Preview After Selection */}
    {selectedGifUrl && (
      <div className="space-y-6">
        <h4 className="font-semibold text-slate-300">
          ✨ This is how your moment will look:
        </h4>

        {/* Beautiful Card with Background */}
        <div className="max-w-sm mx-auto">
          {/* Main Card Container */}
          <div className="rounded-3xl overflow-hidden border border-purple-500/60 bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur-md shadow-2xl">
            
            {/* Background Section with Gradient Overlay */}
            <div className="relative bg-gradient-to-br from-purple-900/30 via-slate-900/40 to-slate-950/50 p-8 rounded-t-3xl space-y-8">
              
              {/* Top Badge */}
              <div className="flex items-center justify-center">
                <div className="inline-block bg-slate-900/70 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-500/40">
                  <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-purple-300">
                    🌈 Status Trio Moment
                  </p>
                </div>
              </div>

              {/* GIF Display - Centered and Beautiful */}
              <div className="flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-900/30 backdrop-blur-sm">
                  <img
                    src={selectedGifUrl}
                    alt="Selected GIF"
                    className="w-48 h-64 object-cover"
                  />
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            </div>

            {/* Text Section Below */}
            <div className="px-8 py-8 space-y-6 bg-gradient-to-b from-slate-900/30 to-slate-950 rounded-b-3xl">
              
              {/* Main Message - Beautiful Typography */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400 font-semibold">
                  Message
                </p>
                <p className="text-center text-lg leading-relaxed font-semibold text-slate-50">
                  &quot;
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300">
                    {finalMessage || userMessage || "Your AI-polished message will appear here."}
                  </span>
                  &quot;
                </p>
              </div>

              {/* Receiver & Sender Info */}
              <div className="space-y-3 border-t border-slate-700/40 pt-4">
                {/* For */}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400 font-semibold">
                    For
                  </p>
                  <p className="text-lg font-bold text-emerald-400">
                    {receiverName ? receiverName : "Someone Special"}
                  </p>
                </div>

                {/* From */}
                {senderName && (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400 font-semibold">
                      From
                    </p>
                    <p className="text-lg font-bold text-slate-100">
                      {senderName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change GIF Button */}
        <button
          onClick={() => {
            setSelectedGifUrl(null);
            setPreview(null);
          }}
          className="w-full py-2 text-slate-300 hover:text-emerald-400 transition text-sm"
        >
          ← Choose Different GIF
        </button>

        {/* Action Button */}
        <button
          onClick={handlePayAndCreate}
          disabled={isProcessing || !selectedGifUrl}
          className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Create & Pay — KES 100
            </>
          )}
        </button>
      </div>
    )}

    {!gifPreviewLoading && gifPreviewUrls.length === 0 && (
      <div className="text-sm text-slate-400 text-center">
        No GIFs found yet.{" "}
        <button
          type="button"
          onClick={fetchGifPreviews}
          className="text-emerald-400 underline underline-offset-2"
        >
          Try again
        </button>
      </div>
    )}

    {/* Back Button */}
    <button
      onClick={() => {
        setSelectedFormat(null);
        setSelectedGifUrl(null);
        setGifPreviewUrls([]);
        setPreview(null);
        setStep(2);
      }}
      className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
    >
      ← Back
    </button>
  </div>
)}
           

        {/* STEP 3: Text Format */}
        {step === 3 && selectedFormat === "text" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8">
              <p className="text-center text-2xl leading-relaxed text-slate-50 font-semibold">
                &quot;{finalMessage}&quot;
              </p>
            </div>

            <button
              onClick={handlePayAndCreate}
              disabled={isProcessing}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Text Moment — FREE ✨
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedFormat(null);
                setStep(2);
              }}
              className="w-full py-2 rounded-lg border border-slate-600 text-slate-300 hover:text-white transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* STEP 4: Success & Share */}
        {step === 4 && (
          <div className="space-y-6 bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-cyan-500/20 border border-emerald-500/50 rounded-2xl p-8 text-center">
            <div className="text-7xl animate-bounce">🎉</div>
            <div>
              <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-purple-400 mb-2">
                Moment Created!
              </h2>
              <p className="text-slate-300">{successMessage}</p>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-emerald-500/50 max-w-sm mx-auto">
                <img src={preview} alt="Your moment" className="w-full h-auto" />
              </div>
            )}

            {/* Share URL */}
            <div className="bg-slate-950/80 rounded-lg p-4 flex items-center justify-between border border-slate-600 backdrop-blur">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-300 outline-none truncate font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 p-2 hover:bg-slate-800 rounded transition flex-shrink-0 hover:text-emerald-400"
                title="Copy link"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={shareOnWhatsApp}
                className="py-3 rounded-lg bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span> WhatsApp
              </button>
              <button
                onClick={downloadMoment}
                disabled={!mediaUrl && !momentId}
                className="py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>

            {/* View Online */}
            <button
              onClick={() => window.open(shareUrl, "_blank")}
              className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold transition border border-slate-600"
            >
              👁️ View Online
            </button>

            {/* Create Another */}
            <button
              onClick={() => {
                setStep(1);
                setReceiverName("");
                setSenderName("");
                setOccasion("");
                setRelationship("");
                setTone("warm");
                setUserMessage("");
                setFinalMessage("");
                setSelectedFormat(null);
                setSelectedTemplate(null);
                setSelectedGifUrl(null);
                setGifPreviewUrls([]);
                setError("");
                setSuccessMessage("");
                setShareUrl("");
                setPreview(null);
                setMomentId(null);
                setMediaUrl(null);
              }}
              className="w-full py-3 rounded-lg border-2 border-emerald-500 text-emerald-400 font-bold hover:bg-emerald-500/20 transition"
            >
              ✨ Create Another Moment
            </button>
          </div>
        )}

        {/* GLOBAL PROCESSING OVERLAY */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl">
              <Loader className="w-6 h-6 animate-spin text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-100">
                  {selectedFormat === "gif"
                    ? "Generating your Status Trio…"
                    : selectedFormat === "still"
                    ? "Creating your Spotlight Poster…"
                    : "Creating your text moment…"}
                </p>
                <p className="text-xs text-slate-400">
                  This may take a few seconds. Please don&apos;t close this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateMomentPage(): JSX.Element {
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