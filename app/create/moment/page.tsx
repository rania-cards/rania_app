"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MediaUploadPanel from "@/components/MediaUploadPanel";

import AboutThemStep from "@/components/AboutThemStep";
import AiMessageStep from "@/components/AiMessageStep";
import DeliveryStylesStep from "@/components/DeliveryStylesStep";
import PreviewStep from "@/components/PreviewStep";
import ShareStep from "@/components/ShareStep";

import type { DeliveryType } from "@/types";
import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  getTemplatesByCategory,
  type TemplateCategory,
  type TemplateStyle,
} from "@/lib/templates";

type WizardStep = 1 | 2 | 3 | 4 | 5;

// Demo fallback user so you can test even before auth is perfect
const DEMO_USER_ID = "demo-user-id-123";
const DEMO_EMAIL = "demo@rania.local";

export default function CreateMomentPage() {
  const supabase = getSupabaseClient();

  // STEP & AUTH
  const [step, setStep] = useState<WizardStep>(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  // ABOUT THEM
  const [receiverName, setReceiverName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("love");

  // TEMPLATE
  const [templateId, setTemplateId] = useState<string | null>(null);

  // MESSAGE
  const [vibe, setVibe] = useState("Sweet");
  const [userMessage, setUserMessage] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // DELIVERY
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("text");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedChoice, setLockedChoice] = useState<DeliveryType | null>(null);

  // PRICING
  const [activeDiscountLabel, setActiveDiscountLabel] = useState<string | null>(
    null
  );
  const [premiumPrice, setPremiumPrice] = useState<number>(130);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [sendMode, setSendMode] = useState<"free" | "premium" | null>(null);

  // REFERRAL
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // SHARE
  const [momentLink, setMomentLink] = useState<string | null>(null);

  // -------- AUTH: get current user (if logged in) --------
  useEffect(() => {
    async function loadUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error getting user", error);
        }
        if (data?.user) {
          setUserId(data.user.id);
          setUserEmail(data.user.email ?? null);
        }
      } catch (err) {
        console.error("Auth load error", err);
      } finally {
        setAuthChecked(true);
      }
    }

    loadUser();
  }, [supabase]);

  // -------- REFERRER: read ?referrer= from URL without useSearchParams --------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("referrer");
      if (ref) setReferrerId(ref);
    } catch (err) {
      console.error("Error reading referrer from URL", err);
    }
  }, []);

  // -------- TEMPLATES: choose default template for category --------
  const templates: TemplateStyle[] = getTemplatesByCategory(category);

  useEffect(() => {
    if (templates.length === 0) return;
    if (!templateId || !templates.some((t) => t.id === templateId)) {
      setTemplateId(templates[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;

  // Effective user identity (real if logged in, demo fallback otherwise)
  const effectiveUserId = userId ?? DEMO_USER_ID;
  const effectiveEmail = userEmail ?? DEMO_EMAIL;

  // -------- DISCOUNT: ask backend for active discount for this user --------
  async function fetchDiscount() {
    try {
      const res = await fetch(
        `/api/discounts?userId=${encodeURIComponent(effectiveUserId)}`
      );
      const data = await res.json();
      if (data.activeDiscount?.price) {
        setPremiumPrice(data.activeDiscount.price);
        setActiveDiscountLabel(`KES ${data.activeDiscount.price} (Limited offer)`);
      } else {
        setPremiumPrice(130);
        setActiveDiscountLabel(null);
      }
    } catch (e) {
      console.error("Failed to fetch discount", e);
      setPremiumPrice(130);
      setActiveDiscountLabel(null);
    }
  }

  // -------- NAVIGATION --------
  function goNext() {
    setStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  }

  function goBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }

  // -------- AI MESSAGE GENERATION --------
  async function handleGenerateMoment() {
    if (!receiverName || !occasion || !relationship) {
      alert("Please fill in name, occasion, and relationship first.");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedText("");

      const res = await fetch("/api/moments/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName,
          occasion,
          relationship,
          vibe,
          userMessage,
          extraDetails,
        }),
      });

      const data = await res.json();
      if (data?.message) {
        setGeneratedText(data.message);
        setStep(3);
      } else {
        console.error("No message returned from API", data);
        alert("Sorry, I couldn't craft the moment. Please try again.");
      }
    } catch (err) {
      console.error("Error generating moment", err);
      alert("Something went wrong while talking to RANIA AI.");
    } finally {
      setIsGenerating(false);
    }
  }

  // -------- DELIVERY SELECTION --------
function handleSelectDelivery(type: DeliveryType) {
  // Lock premium tiles for now (your existing logic)
  if (type === "kid_video" || type === "user_video") {
    setLockedChoice(type);
    setShowUpgradeModal(true);
    return;
  }

  setDeliveryType(type);

  // If going back to plain text, clear any uploaded media
  if (type === "text") {
    setMediaUrl(null);
  }
}

  // -------- CREATE MOMENT (FREE or PREMIUM) --------
  async function handleCreateMomentOnServer(sendAs: "free" | "premium") {
    setSendMode(sendAs);
    await fetchDiscount();

    try {
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  userId: effectiveUserId,
  receiverName,
  occasion,
  relationship,
  tone: vibe,
  category,
  templateId: templateId ?? null,
  deliveryType,
  messageText: generatedText || userMessage,
  mediaUrl: mediaUrl ?? null,
  referrerId: referrerId ?? null,
  useFreePremiumMoment: sendAs === "premium" ? false : undefined,
}),
      });

      const data = await res.json();

      if (!data.moment?.id) {
        console.error("Moment creation failed", data);
        alert("Sorry, the moment could not be saved. Please try again.");
        return;
      }

      const momentId: string = data.moment.id;
      const priceFromServer: number =
        data.pricing?.price ?? (sendAs === "free" ? 0 : premiumPrice);

      setMomentLink(`/moment/${momentId}`);
      setFinalPrice(priceFromServer);

      // If FREE → straight to Share screen
      if (sendAs === "free" || priceFromServer === 0) {
        setStep(5);
        return;
      }

      // PREMIUM → initialize Paystack and redirect
      try {
        const payRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: effectiveEmail,
            amount: priceFromServer,
            reference: `moment-${momentId}`,
          }),
        });

        const payData = await payRes.json();

        if (!payRes.ok || !payData.authorizationUrl) {
          console.error("Paystack init failed", payData);
          alert("Could not start payment. Please try again.");
          return;
        }

        window.location.href = payData.authorizationUrl;
      } catch (err) {
        console.error("Error initializing Paystack", err);
        alert("Payment initialization failed. Please try again.");
      }
    } catch (err) {
      console.error("Error creating moment", err);
      alert("Something went wrong while saving your moment.");
    }
  }

  // -------- LOADING STATE WHILE CHECKING AUTH --------
  if (!authChecked) {
    return (
      <div className="px-4 py-10">
        <div className="max-w-md mx-auto text-center text-slate-300">
          Checking your RANIA account…
        </div>
      </div>
    );
  }

  // -------- RENDER WIZARD --------
  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 mb-1">
            Step {step} of 5
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Let&apos;s create your moment 🎁
          </h1>
          <p className="text-slate-300 text-sm">
            Answer a few playful questions and RANIA will help you craft a
            moment they&apos;ll never forget.
          </p>
          {!userId && (
            <p className="mt-2 text-[11px] text-amber-300">
              You&apos;re in demo mode (no account). Moments are attached to a
              temporary ID. Later, create a real account via{" "}
              <Link href="/auth" className="underline">
                Sign in
              </Link>
              .
            </p>
          )}
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <AboutThemStep
              receiverName={receiverName}
              occasion={occasion}
              relationship={relationship}
              category={category}
              onChangeReceiverName={setReceiverName}
              onChangeOccasion={setOccasion}
              onChangeRelationship={setRelationship}
              onChangeCategory={setCategory}
            />
          )}

          {step === 2 && (
            <AiMessageStep
              vibe={vibe}
              userMessage={userMessage}
              extraDetails={extraDetails}
              generatedText={generatedText}
              isGenerating={isGenerating}
              onChangeVibe={setVibe}
              onChangeUserMessage={setUserMessage}
              onChangeExtraDetails={setExtraDetails}
              onChangeGeneratedText={setGeneratedText}
              onGenerate={handleGenerateMoment}
            />
          )}

       {step === 3 && (
  <>
    <DeliveryStylesStep
      selected={deliveryType}
      activeDiscountLabel={activeDiscountLabel}
      basePrice={premiumPrice}
      onSelectDelivery={handleSelectDelivery}
    />

    {deliveryType === "user_voice" && (
      <MediaUploadPanel
        kind="audio"
        userId={effectiveUserId}
        onUploaded={setMediaUrl}
      />
    )}

    {deliveryType === "user_video" && (
      <MediaUploadPanel
        kind="video"
        userId={effectiveUserId}
        onUploaded={setMediaUrl}
      />
    )}
  </>
)}

          {step === 4 && (
            <PreviewStep
              receiverName={receiverName}
              messageText={generatedText || userMessage}
              deliveryType={deliveryType}
              premiumPrice={premiumPrice}
              activeDiscountLabel={activeDiscountLabel}
              templates={templates}
              selectedTemplateId={templateId}
              onSelectTemplate={setTemplateId}
              onSendFree={() => handleCreateMomentOnServer("free")}
              onSendPremium={() => handleCreateMomentOnServer("premium")}
            />
          )}

          {step === 5 && (
            <ShareStep
              receiverName={receiverName}
              momentLink={momentLink}
              sendMode={sendMode}
              finalPrice={finalPrice}
            />
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            className="text-xs text-slate-400 hover:text-slate-200"
            disabled={step === 1}
            onClick={goBack}
          >
            ← Back
          </button>
          <div className="space-x-2">
            {step < 4 && (
              <button
                className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-100 hover:bg-slate-700"
                onClick={goNext}
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && lockedChoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="max-w-sm w-full mx-4 rounded-2xl bg-slate-900 border border-emerald-500/60 p-5 shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">
              Let&apos;s make this moment unforgettable ✨
            </h2>
            <p className="text-sm text-slate-200 mb-3">
              Video and kid voice delivery unlock deeper emotions 💛
              <br />
              Upgrade this moment for only KES 130.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <button
                className="rounded-full bg-emerald-500 text-slate-950 text-sm font-medium py-2 hover:bg-emerald-400"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setLockedChoice(null);
                  setDeliveryType("text");
                  setStep(4);
                }}
              >
                Unlock Now — KES 130
              </button>
              <button
                className="rounded-full border border-slate-600 text-sm text-slate-100 py-2 hover:bg-slate-800"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setLockedChoice(null);
                  setDeliveryType("text");
                }}
              >
                Keep text only (free)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
