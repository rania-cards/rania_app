

"use client";

import { useState, useEffect } from "react";
import { getGuestId } from "@/lib/guestId";

import DeliveryStyleSelector, {
  DeliveryType,
} from "@/components/DeliveryStyleSelectors";
import MediaUploadPanel from "@/components/MediaUploadPanel";

type Step = 1 | 2 | 3;

type GenerateMessageResponse = {
  message?: string;
  error?: string;
};

type CreateMomentResponse = {
  moment?: {
    id: string;
    url?: string | null;
    delivery_type?: string;
    price_charged?: number | null;
  };
  pricing?: {
    price: number;
    isPremium: boolean;
    hasWatermark: boolean;
  };
  error?: string;
};

type SendMode = "free" | "gif_premium" | "video_premium";

export default function CreateMomentPage() {
  // Wizard step
  const [step, setStep] = useState<Step>(1);
  const totalSteps: Step = 3;

  // Files (only needed for photo/video, NO TTS audio UI)
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Core moment data
  const [receiverName, setReceiverName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [tone, setTone] = useState("Warm");
  const [rawMessage, setRawMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("text");

  // UI state
  const [uiError, setUiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Send state
  const [sendMode, setSendMode] = useState<SendMode | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [momentUrl, setMomentUrl] = useState<string | null>(null);

  // Guest & free usage
  const [guestId, setGuestId] = useState<string | null>(null);
  const [freeCount, setFreeCount] = useState<number>(0);

  useEffect(() => {
    // Clear any old guest ID format (with guest_ prefix)
    const old = localStorage.getItem("rania_guest_id");
    if (old && old.startsWith("guest_")) {
      localStorage.removeItem("rania_guest_id");
    }

    const id = getGuestId();
    setGuestId(id);
    console.log("Current Guest ID:", id);

    // Load free usage count
    const freeCountStr = localStorage.getItem("rania_free_count");
    const parsed = freeCountStr ? parseInt(freeCountStr, 10) : 0;
    if (!Number.isNaN(parsed)) {
      setFreeCount(parsed);
    }
  }, []);

  const currentMessage = aiMessage || rawMessage;

  const handleNext = () => {
    setUiError(null);

    if (step === 1) {
      if (!receiverName.trim() || !occasion.trim() || !relationship.trim()) {
        setUiError("Please fill in the name, occasion, and relationship.");
        return;
      }
      if (!rawMessage.trim()) {
        setUiError("Please write a short message you'd like to send.");
        return;
      }
    }

    if (step === 2 && !currentMessage.trim()) {
      setUiError("Please write or generate a message before continuing.");
      return;
    }

    // When entering Step 3 for a *new* moment, reset previous send state
    if (step === 2) {
      setMomentUrl(null);
      setSendMode(null);
      setFinalPrice(null);
    }

    setStep((prev) => (prev < totalSteps ? ((prev + 1) as Step) : prev));
  };

  const handleBack = () => {
    setUiError(null);

    // If going back from Step 3 → Step 2, clear any “already sent” state
    if (step === 3) {
      setMomentUrl(null);
      setSendMode(null);
      setFinalPrice(null);
    }

    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  const handleGenerateWithAI = async () => {
    setUiError(null);

    if (!receiverName.trim() || !occasion.trim() || !relationship.trim()) {
      setUiError("Please fill in the name, occasion, and relationship first.");
      return;
    }

    if (!rawMessage.trim()) {
      setUiError("Write a short message for RANIA to build from.");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/moments/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: receiverName.trim(),
          occasion: occasion.trim(),
          relationship: relationship.trim(),
          tone,
          userMessage: rawMessage.trim(),
        }),
      });

      const data: GenerateMessageResponse = await res.json();

      if (!res.ok || data?.error) {
        setUiError(
          data?.error ??
            "We couldn’t generate your moment right now. You can still send your own text below."
        );
        return;
      }

      if (data?.message) {
        setAiMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setUiError(
        "Unexpected error while generating your moment. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async (mode: SendMode) => {
    setUiError(null);

    if (!currentMessage.trim()) {
      setUiError("Please make sure your message is not empty.");
      return;
    }

    // Enforce free limit ONLY for free text/GIF sends
    if (mode === "free" && freeCount >= 10) {
      setUiError(
        "You've used your 10 free text/GIF moments on this device. To send more or unlock upgrades, you'll soon need to create a RANIA account."
      );
      return;
    }

    // Basic sanity: video premium must have video delivery type
    if (mode === "video_premium" && deliveryType !== "user_video") {
      setUiError(
        "To send a premium video, please choose the 'Your video' delivery style in Step 2."
      );
      return;
    }

    setIsSending(true);
    setMomentUrl(null);
    setSendMode(mode);

    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          receiverName: receiverName.trim(),
          occasion: occasion.trim(),
          relationship: relationship.trim(),
          tone,
          messageText: currentMessage.trim(),
          deliveryType, // "text" or "user_video"
          pricingTier: mode, // "free" | "gif_premium" | "video_premium" → BACKEND MUST HANDLE
        }),
      });

      const data: CreateMomentResponse = await res.json();

      if (!res.ok || data?.error) {
        setUiError(
          data?.error || "We couldn't create your moment. Please try again."
        );
        return;
      }

      const id = data?.moment?.id;
      const url = data?.moment?.url || (id ? `/moment/${id}` : null);

      if (url) {
        setMomentUrl(url);
      }

      if (data?.pricing?.price != null) {
        setFinalPrice(data.pricing.price);
      } else {
        // Fallback prices if backend doesn't send
        if (mode === "free") setFinalPrice(0);
        if (mode === "gif_premium") setFinalPrice(50);
        if (mode === "video_premium") setFinalPrice(130);
      }

      // If free send succeeded, increment local free count
      if (mode === "free") {
        const newCount = freeCount + 1;
        setFreeCount(newCount);
        if (typeof window !== "undefined") {
          localStorage.setItem("rania_free_count", String(newCount));
        }
      }

      setStep(3);
    } catch (err) {
      console.error(err);
      setUiError(
        "Something went wrong while sending your moment. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* HEADER */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Step {step} of {totalSteps}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Let&apos;s turn your{" "}
            <span className="bg-linear-to-r from-emerald-300 via-teal-200 to-sky-300 text-transparent bg-clip-text">
              feelings into a moment
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            We&apos;ll help you craft something that feels like you — whether
            it&apos;s a text, GIF, or short video.
          </p>
        </section>

        {/* ERROR BANNER */}
        {uiError && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-3 py-2">
            {uiError}
          </div>
        )}

        {/* STEP 1 — ABOUT THEM & RAW MESSAGE */}
        {step === 1 && (
          <section className="space-y-6">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 md:p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                Step 1 · About them
              </p>
              <h2 className="text-lg font-semibold">Who is this moment for?</h2>
              <p className="text-xs text-slate-400">
                Tell us a bit about who you&apos;re sending this to and why.
                This helps us tailor the tone and details.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Their name</label>
                  <input
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Amina, Dad, Bestie…"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Occasion</label>
                  <select
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                  >
                    <option value="">Pick one</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Congratulations">Congratulations</option>
                    <option value="Appreciation">Appreciation</option>
                    <option value="Apology">Apology</option>
                    <option value="Thinking of you">Thinking of you</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Relationship</label>
                  <select
                    className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Friend">Friend</option>
                    <option value="Partner">Partner</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Family">Family</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300">
                  What&apos;s the vibe?
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {["Warm", "Encouraging", "Funny", "Heartfelt", "Short & sweet"].map(
                    (v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTone(v)}
                        className={`px-3 py-1 rounded-full border ${
                          tone === v
                            ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 text-slate-300 hover:border-emerald-400"
                        }`}
                      >
                        {v}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-slate-300">
                  What would you like to say?
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-3 text-sm text-slate-50 outline-none focus:border-emerald-400"
                  value={rawMessage}
                  onChange={(e) => setRawMessage(e.target.value)}
                  placeholder="Write a few lines from the heart. We'll help you refine it in the next step."
                />
                <p className="text-[11px] text-slate-500">
                  Don&apos;t stress about being perfect — just share what you
                  feel.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Next →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STEP 2 — REFINE WITH AI */}
        {step === 2 && (
          <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 md:p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">
              Step 2 · Let RANIA polish your message
            </p>
            <h2 className="text-lg font-semibold">Review & tweak your moment</h2>
            <p className="text-[13px] text-slate-400">
              We&apos;ll use your text + vibe to suggest a warm, natural message
              that fits the moment. You can always edit it.
            </p>

            <button
              type="button"
              disabled={isGenerating || !rawMessage.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateWithAI}
            >
              {isGenerating ? "Crafting your moment..." : "Generate with RANIA"}
            </button>

            <div className="space-y-2">
              <label className="block text-xs text-slate-300">
                Your polished moment
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-3 text-sm text-slate-50 outline-none focus:border-emerald-400"
                value={aiMessage || rawMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Your AI-polished message will appear here. You can still edit it freely."
              />
              <p className="text-[11px] text-slate-500">
                Not feeling it? Hit generate again or tweak the text to sound
                exactly like you.
              </p>
            </div>

            <DeliveryStyleSelector
              value={deliveryType}
              onChange={(value) => {
                setDeliveryType(value);
              }}
            />

            {deliveryType === "user_video" && (
              <MediaUploadPanel
                kind="video" // you can switch this to "image" later if you want photo-only input
                file={videoFile}
                onFileChange={setVideoFile}
              />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-600"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {/* STEP 3 — PREVIEW & SEND */}
        {step === 3 && (
          <section className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 md:p-6 space-y-5">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">
              Step 3 · Preview & send
            </p>
            <h2 className="text-lg font-semibold">Here&apos;s your moment ✨</h2>
            <p className="text-[13px] text-slate-400">
              This is how your moment will look & feel. When you&apos;re happy
              with it, choose how you want to send it.
            </p>

            {/* PREVIEW CARD */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-pink-500/10 p-4 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">
                To:{" "}
                <span className="font-semibold text-slate-100">
                  {receiverName || "Your person"}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mb-2">
                Occasion: {occasion || "Special moment"} · Relationship:{" "}
                {relationship || "Someone special"}
              </p>
              <div className="rounded-xl bg-slate-950/80 p-3">
                <p className="text-[11px] uppercase text-emerald-300 mb-1">
                  {tone} moment
                </p>
                <p className="text-sm text-slate-50 whitespace-pre-line">
                  {currentMessage || "Your message will appear here."}
                </p>
                <p className="mt-3 text-[11px] text-center text-slate-500">
                  Watermark:{" "}
                  <span className="text-emerald-300">
                    Made with ❤️ on RANIA
                  </span>
                </p>
              </div>
            </div>

            {/* ALREADY SENT: SHOW SHARE + WHATSAPP */}
            {momentUrl && (
              <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3 text-xs text-slate-300 space-y-3">
                <p className="font-semibold text-slate-100">
                  Your moment is ready ✅
                </p>

                <p>You can share this link with them:</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!momentUrl) return;
                    const fullUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}${momentUrl}`
                        : momentUrl;
                    void navigator.clipboard.writeText(fullUrl);
                  }}
                  className="mt-1 w-full rounded-full bg-slate-800 px-3 py-2 text-xs text-slate-100 hover:bg-slate-700 text-left break-all"
                >
                  {momentUrl}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!momentUrl) return;
                    const fullUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}${momentUrl}`
                        : momentUrl;

                    const text = encodeURIComponent(
                      `I made this for you on RANIA 💛\n\n${fullUrl}`
                    );
                    const waUrl = `https://wa.me/?text=${text}`;
                    if (typeof window !== "undefined") {
                      window.open(waUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="w-full rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
                >
                  Share on WhatsApp
                </button>

                <p className="text-[11px] text-slate-500">
                  We&apos;ll add more share options (Instagram, SMS) later. For
                  now, WhatsApp is the fastest way to drop this in their chats.
                </p>
              </div>
            )}

            {/* SEND BUTTONS (only if not already sent) */}
            {!momentUrl && (
              <>
                {/* TEXT/GIF MODE: FREE + KES 50 UPGRADE */}
                {deliveryType === "text" && (
                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSend("free")}
                      className="flex-1 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending && sendMode === "free"
                        ? "Sending..."
                        : "Send as text / GIF (Free)"}
                    </button>

                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSend("gif_premium")}
                      className="flex-1 rounded-full bg-indigo-500/90 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending && sendMode === "gif_premium"
                        ? "Processing..."
                        : "Upgrade text / GIF — KES 50"}
                    </button>
                  </div>
                )}

                {/* VIDEO MODE: ONLY KES 130 OPTION */}
                {deliveryType === "user_video" && (
                  <div className="flex flex-col md:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => handleSend("video_premium")}
                      className="flex-1 rounded-full bg-fuchsia-500/90 px-5 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending && sendMode === "video_premium"
                        ? "Processing..."
                        : "Send as video — KES 130"}
                    </button>
                  </div>
                )}
              </>
            )}

            <p className="text-[11px] text-slate-500">
              Free sends include a tiny &quot;Made with ❤️ on RANIA&quot; tag.
              KES 50 upgrades polish your text/GIF moment, and premium video at
              KES 130 turns it into a full cinematic moment.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-600"
              >
                ← Back
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}