"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";

import Link from "next/link";


import AboutThemStep from "@/components/AboutThemStep";
import AiMessageStep from "@/components/AiMessageStep";
import DeliveryStylesStep from "@/components/DeliveryStylesStep";
import PreviewStep from "@/components/PreviewStep";
import ShareStep from "@/components/ShareStep";
import type { DeliveryType } from "@/types";

import {
  getTemplatesByCategory,
  type TemplateCategory,
} from "@/lib/templates";

type WizardStep = 1 | 2 | 3 | 4 | 5;

// Demo fallback user (for dev mode)
const DEMO_USER_ID = "demo-user-id-123";
const DEMO_EMAIL = "demo@rania.local";

export default function CreateMomentPage() {
  const [step, setStep] = useState<WizardStep>(1);

  const supabase = getSupabaseClient();
  const searchParams = useSearchParams();

  // Auth
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // About them
  const [receiverName, setReceiverName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("love");
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Message
  const [vibe, setVibe] = useState("Sweet");
  const [userMessage, setUserMessage] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Delivery
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("text");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedChoice, setLockedChoice] = useState<DeliveryType | null>(null);

  // Pricing
  const [activeDiscountLabel, setActiveDiscountLabel] = useState<string | null>(
    null
  );
  const [premiumPrice, setPremiumPrice] = useState(130);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [sendMode, setSendMode] = useState<"free" | "premium" | null>(null);

  // Share
  const [momentLink, setMomentLink] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);

  // Load auth user (if logged in)
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user", error);
      }
      if (data?.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? null);
      }
      setAuthChecked(true);
    }

    loadUser();
  }, [supabase]);

  // Capture referrer from URL (for referral tracking)
  useEffect(() => {
    const ref = searchParams.get("referrer");
    if (ref) {
      setReferrerId(ref);
    }
  }, [searchParams]);

  // Template auto-selection based on category
  useEffect(() => {
    const list = getTemplatesByCategory(category);
    if (list.length > 0) {
      if (!templateId || !list.some((t) => t.id === templateId)) {
        setTemplateId(list[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Effective user + email (real if logged in, demo otherwise)
  const EFFECTIVE_USER_ID = userId ?? DEMO_USER_ID;
  const EFFECTIVE_EMAIL = userEmail ?? DEMO_EMAIL;

  // Templates for current category
  const templates = getTemplatesByCategory(category);

  // Discount fetch
  async function fetchDiscount() {
    try {
      const res = await fetch(
        `/api/discounts?userId=${encodeURIComponent(EFFECTIVE_USER_ID)}`
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

  function goNext() {
    setStep((prev) => (prev < 5 ? ((prev + 1) as WizardStep) : prev));
  }

  function goBack() {
    setStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  }

  async function handleGenerateMoment() {
    if (!receiverName || !occasion || !relationship) {
      alert("Please fill in 'About Them' first (name, occasion, relationship).");
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
        setStep(3); // go to delivery step
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

  function handleSelectDelivery(type: DeliveryType) {
    // For now: user_video and kid_video are "locked" and should show upgrade modal
    if (type === "user_video" || type === "kid_video") {
      setLockedChoice(type);
      setShowUpgradeModal(true);
      return;
    }
    setDeliveryType(type);
  }

  async function handleCreateMomentOnServer(sendAs: "free" | "premium") {
    setSendMode(sendAs);
    await fetchDiscount(); // ensure we have latest discount

    try {
      // 1) Create the moment on our backend
      const res = await fetch("/api/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: EFFECTIVE_USER_ID,
          receiverName,
          occasion,
          relationship,
          tone: vibe,
          category,
          templateId: templateId ?? null,
          deliveryType,
          messageText: generatedText || userMessage,
          mediaUrl: null,
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

      const momentId = data.moment.id as string;
      const priceFromServer: number =
        data.pricing?.price ?? (sendAs === "free" ? 0 : premiumPrice ?? 130);

      setMomentLink(`/moment/${momentId}`);
      setFinalPrice(priceFromServer);

      // 2) If FREE → go straight to share step
      if (sendAs === "free" || priceFromServer === 0) {
        setStep(5);
        return;
      }

      // 3) PREMIUM → initialize Paystack and redirect
      try {
        const payRes = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: EFFECTIVE_EMAIL,
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

        // Redirect user to Paystack checkout
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

  // While checking auth, show a tiny loader
  if (!authChecked) {
    return (
      <div className="px-4 py-10">
        <div className="max-w-md mx-auto text-center text-slate-300">
          Checking your RANIA account…
        </div>
      </div>
    );
  }

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
              You&apos;re in demo mode (not signed in). Moments are still saved,
              but later you&apos;ll want a real account via{" "}
              <Link
                href="/auth"
                className="underline"
              >
                Sign in
              </Link>
              .
            </p>
          )}
        </div>

        {/* STEPS */}
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
              onGenerate={handleGenerateMoment}
              onChangeGeneratedText={setGeneratedText}
            />
          )}

          {step === 3 && (
            <DeliveryStylesStep
              selected={deliveryType}
              activeDiscountLabel={activeDiscountLabel}
              basePrice={premiumPrice}
              onSelectDelivery={handleSelectDelivery}
            />
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

        {/* NAV BUTTONS */}
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

      {/* UPGRADE MODAL FOR LOCKED DELIVERY TYPES */}
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
                  // For now we just close and keep selection as text.
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