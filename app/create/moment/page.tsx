/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getGuestId } from "@/lib/guestId";
import {
  renderStillImage,
  generateGifMomentPreview,
  getAllTemplates,
  getAllGifPacks,
  StillTemplateId,
  GifPackId,
} from "@/lib/momentRenderer";
import { initPaystackPayment, verifyPaystackPayment } from "@/lib/paystackClients";
import { v4 as uuidv4 } from "uuid";
import {
  Heart,
  Sparkles,
  Copy,
  Share2,
  Download,
  Loader,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;
type DeliveryFormat = "text" | "still" | "gif";

// Supabase client (browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function CreateMomentContent() {
  const router = useRouter();
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
  const [selectedFormat, setSelectedFormat] = useState<DeliveryFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StillTemplateId | null>(null);
  const [selectedGifPack, setSelectedGifPack] = useState<GifPackId | null>(null);

  // UI State
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [momentId, setMomentId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    const id = getGuestId();
    setGuestId(id);
    checkPendingPayment(id);
  }, []);

  const checkPendingPayment = async (id: string) => {
    try {
      const lastReference = sessionStorage.getItem("lastPaystackReference");
      const pendingData = sessionStorage.getItem("pendingDelivery");

      if (lastReference && pendingData) {
        setIsAutoCreating(true);
        const verified = await verifyPaystackPayment(lastReference);

        if (verified.status === "success") {
          const parsed = JSON.parse(pendingData);
          await createMoment(
            parsed.delivery,
            true,
            parsed.delivery === "still" ? 50 : 100,
            lastReference,
            id,
            parsed
          );
          sessionStorage.removeItem("lastPaystackReference");
          sessionStorage.removeItem("pendingDelivery");
        } else if (verified.status === "pending") {
          setError("Payment is being processed...");
          setTimeout(() => checkPendingPayment(id), 3000);
        }
      }
    } catch (err: any) {
      console.error("Payment check error:", err);
      setIsAutoCreating(false);
    }
  };

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
          gender: gender, // pass gender to AI prompt
          userMessage: userMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate");

      setFinalMessage(data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = async (templateId: StillTemplateId) => {
    setSelectedTemplate(templateId);
    try {
      // renderStillImage returns a dataURL (png) preview
      const preview = await renderStillImage(templateId, finalMessage, senderName);
      setPreview(preview);
    } catch (err) {
      console.error("Preview error:", err);
      setError("Failed to generate preview");
    }
  };

  const handleSelectGifPack = async (gifPackId: GifPackId) => {
    setSelectedGifPack(gifPackId);
    try {
      // generateGifMomentPreview should return a dataURL or blob URL preview
      const previewUrl = await generateGifMomentPreview(gifPackId, finalMessage, senderName);
      setPreview(previewUrl);
    } catch (err) {
      console.error("GIF preview error:", err);
      setError("Failed to generate preview");
    }
  };

  // --- helper: convert dataURL -> Blob
  const dataUrlToBlob = (dataUrl: string) => {
    const parts = dataUrl.split(",");
    const meta = parts[0];
    const base64 = parts[1];
    const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
    const binary = atob(base64);
    const len = binary.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = binary.charCodeAt(i);
    return new Blob([buf], { type: mime });
  };

  // upload dataURL (png) to Supabase storage, returns public URL
  const uploadDataUrlToSupabase = async (dataUrl: string, filenamePrefix = "still") => {
    try {
      const blob = dataUrlToBlob(dataUrl);
      const ext = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "png";
      const fileName = `${filenamePrefix}-${uuidv4()}.${ext}`;
      const path = fileName;
      const { data, error } = await supabase.storage
        .from("moments-media")
        .upload(path, blob as any, { upsert: true });

      if (error) throw error;

      const publicUrl = supabase.storage.from("moments-media").getPublicUrl(data.path).data.publicUrl;
      return publicUrl;
    } catch (err: any) {
      console.error("Supabase upload error:", err);
      throw err;
    }
  };

  // upload a Blob/Response blob (like fetched gif blob)
  const uploadBlobToSupabase = async (blob: Blob, filenamePrefix = "gif") => {
    try {
      const ext = blob.type === "image/gif" ? "gif" : blob.type === "video/mp4" ? "mp4" : "bin";
      const fileName = `${filenamePrefix}-${uuidv4()}.${ext}`;
      const path = fileName;
      const { data, error } = await supabase.storage
        .from("moments-media")
        .upload(path, blob as any, { upsert: true });

      if (error) throw error;

      const publicUrl = supabase.storage.from("moments-media").getPublicUrl(data.path).data.publicUrl;
      return publicUrl;
    } catch (err: any) {
      console.error("Supabase upload error:", err);
      throw err;
    }
  };

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

      if (selectedFormat === "gif" && !selectedGifPack) {
        setError("Please select a GIF pack");
        return;
      }

      setIsProcessing(true);

      const isPaid = selectedFormat === "still" || selectedFormat === "gif";
      const amount = selectedFormat === "still" ? 50 : selectedFormat === "gif" ? 100 : 0;

      if (isPaid) {
        const pendingData = {
          delivery: selectedFormat,
          message: finalMessage,
          template: selectedTemplate || null,
          gifPack: selectedGifPack || null,
          receiverName,
          senderName,
          occasion,
          relationship,
          tone,
          gender,
        };
        sessionStorage.setItem("pendingDelivery", JSON.stringify(pendingData));

        const reference = uuidv4();
        sessionStorage.setItem("lastPaystackReference", reference);

        await initPaystackPayment({
          email: "guest@raniaonline.com",
          amount,
          reference,
          onError: (err) => {
            setError(err.message || "Payment failed");
            setIsProcessing(false);
            sessionStorage.removeItem("pendingDelivery");
            sessionStorage.removeItem("lastPaystackReference");
          },
        });
      } else {
        await createMoment(selectedFormat, false, 0, null, guestId, {
          receiverName,
          senderName,
          occasion,
          relationship,
          tone,
          gender,
          message: finalMessage,
        });
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
    id: string,
    data: any
  ) => {
    try {
      setError("");
      setIsProcessing(true);

      // Build core moment payload
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
        template: selectedTemplate || null,
        gifPack: selectedGifPack || null,
        isPremium,
        priceCharged,
        referrerId: reference || null,
      };

      // 1) Generate / upload media to Supabase depending on format
      if (delivery === "text") {
        // generate PNG dataURL for text
        const textDataUrl = await textToImage(payload.messageText, payload.senderName);
        // upload to supabase
        const publicUrl = await uploadDataUrlToSupabase(textDataUrl, "text");
        payload.mediaUrl = publicUrl;
      } else if (delivery === "still") {
        // renderStillImage returns a dataURL
        const stillDataUrl = await renderStillImage(payload.template, payload.messageText, payload.senderName);
        const publicUrl = await uploadDataUrlToSupabase(stillDataUrl, "still");
        payload.mediaUrl = publicUrl;
      } else if (delivery === "gif") {
        // generateGifMomentPreview may return a dataURL or an object URL
        const preview = await generateGifMomentPreview(payload.gifPack, payload.messageText, payload.senderName);
        // normalize: if preview is a dataURL string -> uploadDataUrlToSupabase; if preview is a blob/object url, fetch -> blob -> uploadBlobToSupabase
        if (typeof preview === "string" && preview.startsWith("data:")) {
          const publicUrl = await uploadDataUrlToSupabase(preview, "gif");
          payload.mediaUrl = publicUrl;
        } else {
          // assume preview is a URL (blob/object URL or http)
          const res = await fetch(preview);
          const blob = await res.blob();
          const publicUrl = await uploadBlobToSupabase(blob, "gif");
          payload.mediaUrl = publicUrl;
        }
      }

      // 2) Create moment record on backend (your existing /api/moments will store this)
      const response = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create moment");
      }

      const { moment } = await response.json();
      setMomentId(moment.id);
      setShareUrl(`${window.location.origin}/moment/${moment.id}`);
      setMediaUrl(moment.mediaUrl || payload.mediaUrl || null);

      setSuccessMessage(
        `${delivery === "text" ? "📝 Text" : delivery === "still" ? "🖼️ Still" : "🎬 GIF"} moment created! 🎉`
      );
      setStep(4);
    } catch (err: any) {
      console.error("Create moment error:", err);
      setError(err.message || "Failed to create moment");
    } finally {
      setIsProcessing(false);
      setIsAutoCreating(false);
    }
  };

  // generate a PNG dataURL from text (used for text-only moments)
  // ADD ALL THESE FUNCTIONS IN THIS ORDER
// Place them AFTER the textToImage function location in your component

// ========== 1. TEXT TO IMAGE FUNCTION ==========
const textToImage = async (text: string, signature?: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  
  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  // background gradient
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "#111827");
  g.addColorStop(1, "#0f172a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  // text style
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";

  const baseFont = 48;
  ctx.font = `700 ${baseFont}px Inter, system-ui, Arial`;
  const maxWidth = width - 160;

  // wrap text
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    ctx.font = `700 ${baseFont}px Inter, system-ui, Arial`;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);

  // reduce font if too many lines
  let fontSize = baseFont;
  while (lines.length * (fontSize * 1.2) > height * 0.6 && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `700 ${fontSize}px Inter, system-ui, Arial`;
    const newLines: string[] = [];
    cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && cur) {
        newLines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) newLines.push(cur);
    lines.splice(0, lines.length, ...newLines);
  }

  // draw text
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${fontSize}px Inter, system-ui, Arial`;
  const lineHeight = fontSize * 1.25;
  const startY = height / 2 - (lines.length - 1) * lineHeight / 2;

  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;

  let y = startY;
  for (const line of lines) {
    ctx.fillText(line.trim(), width / 2, y);
    y += lineHeight;
  }

  // signature
  if (signature) {
    ctx.shadowColor = "transparent";
    ctx.font = `500 20px Inter, system-ui, Arial`;
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(`— ${signature}`, width / 2, height - 80);
  }

  return canvas.toDataURL("image/png");
};

// ========== 2. SHARE ON WHATSAPP ==========
const shareOnWhatsApp = async () => {
  try {
    setError("");
    
    if (!mediaUrl) {
      setError("No media available to share");
      return;
    }

    const res = await fetch(mediaUrl);
    if (!res.ok) {
      throw new Error("Failed to fetch media for sharing");
    }
    
    const blob = await res.blob();
    const fileName = `rania-moment.${blob.type === "image/gif" ? "gif" : "png"}`;
    const file = new File([blob], fileName, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My Rania Moment",
          text: finalMessage,
        });
        setSuccessMessage("Shared to WhatsApp! 💬");
        setTimeout(() => setSuccessMessage(""), 2000);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.log("Share API failed, trying fallback");
      }
    }

    const encoded = encodeURIComponent(`Check out my Rania moment!\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    setSuccessMessage("Opening WhatsApp... 💬");
    setTimeout(() => setSuccessMessage(""), 2000);
  } catch (err: any) {
    console.error("Share error:", err);
    setError(`Share failed: ${err.message}`);
  }
};

// ========== 3. DOWNLOAD MOMENT ==========
const downloadMoment = async () => {
  try {
    setError("");
    
    let downloadUrl = mediaUrl;
    
    if (!downloadUrl && momentId) {
      try {
        const response = await fetch(`/api/moments/${momentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch moment details");
        }
        const data = await response.json();
        downloadUrl = data.moment?.mediaUrl || data.moment?.gifUrl || null;
      } catch (err: any) {
        throw new Error("Could not retrieve media URL from server");
      }
    }

    if (!downloadUrl) {
      setError("No media available for download");
      return;
    }

    if (!downloadUrl.startsWith("http://") && !downloadUrl.startsWith("https://")) {
      setError("Invalid media URL");
      return;
    }

    const res = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        "Accept": "image/png, image/gif, image/jpeg, image/*",
      },
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
    }

    const blob = await res.blob();
    
    if (!blob || blob.size === 0) {
      setError("Downloaded file is empty");
      return;
    }
    
    let ext = "png";
    if (blob.type === "image/gif") ext = "gif";
    else if (blob.type === "image/jpeg") ext = "jpg";
    else if (blob.type === "application/octet-stream") {
      if (downloadUrl.includes(".gif")) ext = "gif";
      else if (downloadUrl.includes(".jpg")) ext = "jpg";
      else ext = "png";
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `rania-moment-${momentId || Date.now()}.${ext}`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 100);

    setSuccessMessage("Downloaded! 📥");
    setTimeout(() => setSuccessMessage(""), 2000);
  } catch (err: any) {
    console.error("Download error:", err);
    setError(`Download failed: ${err.message}`);
  }
};

// ========== 4. SHARE IMAGE DIRECT (Alternative) ==========
const shareImageDirect = async () => {
  try {
    if (!mediaUrl) {
      setError("No media available to share");
      return;
    }

    const res = await fetch(mediaUrl);
    const blob = await res.blob();

    if (navigator.canShare && navigator.canShare({ files: [new File([], "")] })) {
      const file = new File([blob], `rania-moment.${blob.type === "image/gif" ? "gif" : "png"}`, {
        type: blob.type,
      });

      await navigator.share({
        files: [file],
        title: "My Rania Moment",
        text: finalMessage,
      });
    } else {
      const encoded = encodeURIComponent(`Check out my Rania moment! ${shareUrl}`);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("Share error:", err);
      const encoded = encodeURIComponent(`Check out my Rania moment! ${shareUrl}`);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
  }
};

// ========== 5. COPY TO CLIPBOARD (Last) ==========
const copyToClipboard = () => {
  navigator.clipboard.writeText(shareUrl);
  setSuccessMessage("Link copied! 📋");
  setTimeout(() => setSuccessMessage(""), 2000);
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-black text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-emerald-400" />
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Create Moment
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-slate-300 text-lg">Say what matters in a way they&apos;ll never forget</p>
        </div>

        {/* Error & Success Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex gap-3 animate-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {successMessage && successMessage !== "Link copied! 📋" && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex gap-3 animate-in">
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
                <label className="block text-sm font-semibold text-slate-200 mb-2">📅 Occasion</label>
                <input
                  type="text"
                  placeholder="e.g., Birthday, Anniversary..."
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">💝 Relationship</label>
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
                <label className="block text-sm font-semibold text-slate-200 mb-2">⚧ Gender (affects wording)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition"
                >
                  <option value="none">Prefer not to specify</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">🎭 Tone/Vibe</label>
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
              <label className="block text-sm font-semibold text-slate-200 mb-2">💬 What do you want to say?</label>
              <textarea
                placeholder="Share what's on your heart... Be authentic!"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-600 text-white focus:border-emerald-400 outline-none transition min-h-[150px] resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">{userMessage.length}/500 characters</p>
                {userMessage.length > 450 && <p className="text-xs text-amber-400">Keep it concise for best results!</p>}
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
              <h3 className="text-lg font-bold text-slate-200">How would you like to share it?</h3>

              <button
                onClick={() => {
                  setSelectedFormat("text");
                  setStep(3);
                }}
                className="w-full p-6 rounded-xl border-2 border-emerald-500/50 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-400 mb-1 text-lg">📝 Text Moment</h4>
                    <p className="text-sm text-slate-300">Clean text card, perfect for sharing</p>
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
                    <h4 className="font-bold text-indigo-400 mb-1 text-lg">🖼️ Still Moment</h4>
                    <p className="text-sm text-slate-300">Beautiful animated background + text</p>
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
                    <h4 className="font-bold text-purple-400 mb-1 text-lg">🎬 GIF Pack</h4>
                    <p className="text-sm text-slate-300">3 animated GIFs with effects & colors</p>
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

        {/* STEP 3: Select Template/Pack & Preview */}
        {step === 3 && selectedFormat === "still" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">🎨 Choose Your Background</h3>
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
                    <p className="text-white font-semibold text-sm">{template.name}</p>
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

        {/* STEP 3: GIF Pack Selection */}
        {step === 3 && selectedFormat === "gif" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-200">🌈 Choose Your GIF Style</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {getAllGifPacks().map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => handleSelectGifPack(pack.id)}
                  className={`p-6 rounded-xl border-2 transition ${
                    selectedGifPack === pack.id
                      ? "border-purple-400 bg-purple-500/20"
                      : "border-slate-600 hover:border-purple-400 bg-slate-800/50 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-lg">{pack.name}</h4>
                    {selectedGifPack === pack.id && (
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    {pack.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-lg border border-slate-500"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {selectedGifPack && preview && (
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-300">Preview:</h4>
                <div className="rounded-xl overflow-hidden border border-purple-500/50 max-w-sm mx-auto">
                  <img src={preview} alt="GIF Preview" className="w-full h-auto" />
                </div>

                <button
                  onClick={handlePayAndCreate}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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

            <button
              onClick={() => {
                setSelectedFormat(null);
                setSelectedGifPack(null);
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

            {/* Display Preview */}
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

            {/* View Online Button */}
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
                setSelectedGifPack(null);
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
